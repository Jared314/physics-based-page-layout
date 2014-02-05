var DEFAULT_MASS = 1,
	DEFAULT_DRAG = 0.8,
	POS_TOP = 0,
	POS_RIGHT = 1,
	POS_BOTTOM = 2,
	POS_LEFT = 3;


//TODO: look into nesting ParticleSystems

function getNodeParticle(getfn, node, selector, option1, option2){
	//TODO: Lazy init targetnode particle group
	var targetnode = getfn(selector)[0],
		i = targetnode.contains(node) ? option1 : option2;

	return targetnode.pls.particlegroup[i];
}

var plsHandlers = {
	'spring': function(particlesystem, node, particlegroup, getfn, top, right, bottom, left){
		right = right || top;
		bottom = bottom || top;
		left = left || right;

		var restlength = 0,
			strength = 0.75;

		console.log('spring', top, right, bottom, left);

		var topp = getNodeParticle(getfn, node, top, POS_TOP, POS_BOTTOM);
		var rightp = getNodeParticle(getfn, node, right, POS_RIGHT, POS_LEFT);
		var bottomp = getNodeParticle(getfn, node, bottom, POS_BOTTOM, POS_TOP);
		var leftp = getNodeParticle(getfn, node, left, POS_LEFT, POS_RIGHT);

		return [
			particlesystem.makeSpring(particlegroup[POS_TOP], topp, strength, DEFAULT_DRAG, restlength),
			particlesystem.makeSpring(particlegroup[POS_RIGHT], rightp, strength, DEFAULT_DRAG, restlength),
			particlesystem.makeSpring(particlegroup[POS_BOTTOM], bottomp, strength, DEFAULT_DRAG, restlength),
			particlesystem.makeSpring(particlegroup[POS_LEFT], leftp, strength, DEFAULT_DRAG, restlength)
		];
	}
};

function clearCSSPosition(selector){
	$(selector).css({
		position: "absolute",
		left:0,
		top:0,
		margin:0,
		padding:0,
		height:0,
		width:0
	});
}

function dispatch(particlesystem, fns, nodes, declarations, getfn){
	var ks = Object.keys(declarations);
	
	nodes.forEach(function(node){
		var pg = node.pls.particlegroup || [];

		ks.forEach(function(k){
			if(!fns[k]) return;
			var args = declarations[k].split(' ')
									  .filter(function(x){ return x !== null && x !== ''; });
			fns[k].apply(null, [particlesystem, node, pg, getfn].concat(args));
		});
	});
}

function createParticleGroup(p){
	var restlength = 0,
		strength = 0.75;
	var p1 = p.makeParticle(DEFAULT_MASS, 0, 0),
		p2 = p.makeParticle(DEFAULT_MASS, 0, 0),
		p3 = p.makeParticle(DEFAULT_MASS, 0, 0),
		p4 = p.makeParticle(DEFAULT_MASS, 0, 0);

	return {
		particlegroup: [p1, p2, p3, p4],
		springgroup: [
			p.makeSpring(p1, p2, strength, DEFAULT_DRAG, restlength),
  			p.makeSpring(p2, p3, strength, DEFAULT_DRAG, restlength),
			p.makeSpring(p3, p4, strength, DEFAULT_DRAG, restlength),
			p.makeSpring(p4, p1, strength, DEFAULT_DRAG, restlength)
		]
	};
}

function createNonPLSParticleGroup(particlesystem, el, w, h){
	var w = w || el.clientWidth,
		h = h || el.clientHeight,
		mass = 1;
	
	var body1 = particlesystem.makeParticle(mass, w/2, 0).makeFixed();
	var body2 = particlesystem.makeParticle(mass, w, h/2).makeFixed();
	var body3 = particlesystem.makeParticle(mass, w/2, h).makeFixed();
	var body4 = particlesystem.makeParticle(mass, 0, h/2).makeFixed();

	return {
  		particlegroup: [body1, body2, body3, body4]
  	};
}


function applyRuleList(particlesystem, rulelist, fns, getfn){
	var rules = rulelist.filter(function(item){ return item.type === "style"; });

	//TODO: lazily generate particlegroups
	// Pre-generate node particlegroups
	rules.forEach(function(item){
		getfn(item.selector).forEach(function(item){
			var g = null;

			item.pls = item.pls || {};
			item.pls.particlegroup = item.pls.particlegroup || [];
			
			//Generate node particles and springs
			if(item.pls.particlegroup.length < 1) {
				g = createParticleGroup(particlesystem);
				item.pls.particlegroup = g.particlegroup;
				item.pls.springgroup = g.springgroup;
			}

			return item;
		});				
	});

	rules.forEach(function(item){
		//Remove selected elements from css layout
		clearCSSPosition(item.selector);

		//Execute rulelists against the particlesystem
		dispatch(particlesystem, fns, getfn(item.selector), item.declarations, getfn);
	});
}


// function resetDocumentParticleGroup(ww, wh){
// 	var pg = document.body.pls.particlegroup;
  
// 	pg[POS_TOP].x = ww/2;
// 	pg[POS_TOP].y = 0;

// 	pg[POS_RIGHT].x = ww;
// 	pg[POS_RIGHT].y = wh/2;

// 	pg[POS_BOTTOM].x = ww/2;
// 	pg[POS_BOTTOM].y = wh;

// 	pg[POS_LEFT].x = 0;
// 	pg[POS_LEFT].y = wh/2;
// }



function updatefn(){
  	var pg = document.getElementById('item1').pls.particlegroup;
  	var t = pg[POS_TOP].position.y;
  	var l = pg[POS_LEFT].position.x;
  	var w = pg[POS_RIGHT].position.x - pg[POS_LEFT].position.x;
  	var h = pg[POS_BOTTOM].position.y - pg[POS_TOP].position.y;

  	$('#item1').css({
  		'top': t + 'px',
  		'left': l + 'px',
  		'width': w + 'px',
  		'height': h + 'px'
  	});

  	var pg = document.getElementById('item2').pls.particlegroup;
  	var t = pg[POS_TOP].position.y;
  	var l = pg[POS_LEFT].position.x;
  	var w = pg[POS_RIGHT].position.x - pg[POS_LEFT].position.x;
  	var h = pg[POS_BOTTOM].position.y - pg[POS_TOP].position.y;

  	$('#item2').css({
  		'top': t + 'px',
  		'left': l + 'px',
  		'width': w + 'px',
  		'height': h + 'px'
  	});
}


document.addEventListener('DOMContentLoaded', function(){
  // var mass = 1;
  // var strength = 0.75;
  // var drag = 0.8;
  // var rest = 70.71; // 50^2 + 50^2 = c^2
	
  var p = new Physics();
  p.onUpdate(updatefn);
  p.optimize(true);
  p.setEquilibriumCriteria(true, false, false);
  p.onEquilibrium(updatefn);

  document.body.pls = createNonPLSParticleGroup(p, 
                                                document,
                                                $(document).width(),
                                                $(document).height());

  var pls = cssparser.parse($("style[type='text/x-pbpl']").text().trim());
  applyRuleList(p, pls.rulelist, plsHandlers, function(selector){
  	return Array.prototype.slice.call(document.querySelectorAll(selector));
  });

  // $(window).on('resize', function(){resetDocumentParticleGroup($(document).width(), $(document).height()); p.play(); });

  p.play();	
});