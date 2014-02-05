(function($){
'use strict';

var VERSION = "0.0.1",
	DEFAULT_MASS = 1,
	DEFAULT_DRAG = 0.8,
	DEFAULT_SPRING_STRENGTH = 0.75,
	DEFAULT_SPRING_REST_LENGTH = 0,
	POS_TOP = 0,
	POS_RIGHT = 1,
	POS_BOTTOM = 2,
	POS_LEFT = 3;


//TODO: look into nesting ParticleSystems

function createBoxSpringGroup(particlesystem, particlegroup){
	var restlength = DEFAULT_SPRING_REST_LENGTH,
		strength = DEFAULT_SPRING_STRENGTH,
		drag = DEFAULT_DRAG;

	return [
		particlesystem.makeSpring(particlegroup[0], particlegroup[1], strength, drag, restlength),
		particlesystem.makeSpring(particlegroup[1], particlegroup[2], strength, drag, restlength),
		particlesystem.makeSpring(particlegroup[2], particlegroup[3], strength, drag, restlength),
		particlesystem.makeSpring(particlegroup[3], particlegroup[0], strength, drag, restlength)
	];
}

function createParticleGroup(particlesystem, fixed, w, h){
	var w = w || 0,
		h = h || 0,
		mass = DEFAULT_MASS;

	var result = [
		particlesystem.makeParticle(mass, w/2, 0),
		particlesystem.makeParticle(mass, w, h/2),
		particlesystem.makeParticle(mass, w/2, h),
		particlesystem.makeParticle(mass, 0, h/2)
	];

	if(fixed){
		result.forEach(function(item){ item.makeFixed(); });
	}

	return result;
}

function guaranteeNodeParticleGroup(particlesystem, node){
	node.pls = node.pls || {};

	if(!node.pls.particlegroup){
		var w = node.clientWidth,
			h = node.clientHeight,
			fixed = false;

		if(node === document.body){
			//TODO: remove jQuery
			w = $(document).width();
			h = $(document).height();
			fixed = true;
		}

		node.pls.particlegroup = createParticleGroup(particlesystem, fixed, w, h);
	}
	return node;
}

function getNode(particlesystem, selector){
	return Array.prototype.slice.call(document.querySelectorAll(selector))
		.map(function(item){ return guaranteeNodeParticleGroup(particlesystem, item); });
}

function getNodeParticle(getfn, node, selector, option1, option2){
	if(selector.toLowerCase() === "false") return false;

	var targetnode = getfn(selector)[0],
		i = targetnode.contains(node) ? option1 : option2;

	targetnode.pls = targetnode.pls || {};
	targetnode.pls.particlegroup = targetnode.pls.particlegroup || [];

	return targetnode.pls.particlegroup[i];
}

var springSideHandler = function(particlesystem, node, particlegroup, getfn, side, target, targetside, strength, drag, restlength){
	strength = strength || DEFAULT_SPRING_STRENGTH;
	drag = drag || DEFAULT_DRAG;
	restlength = restlength || DEFAULT_SPRING_REST_LENGTH;
	targetside = targetside || side;

	var defaultSides = {
		'top': [POS_TOP, POS_BOTTOM],
		'bottom': [POS_BOTTOM, POS_TOP],
		'left': [POS_LEFT, POS_RIGHT],
		'right': [POS_RIGHT, POS_LEFT]
	};

	var sideIndex = defaultSides[side.toLowerCase()][0];
	var targetSideIndexes = defaultSides[targetside.toLowerCase()];

	var basep = particlegroup[sideIndex];
	var targetp = getNodeParticle(getfn, node, target, targetSideIndexes[0], targetSideIndexes[1]);
	
	return particlesystem.makeSpring(basep, targetp, strength, drag, restlength);
};




var declarationHandlers = {
	'spring': function(particlesystem, node, particlegroup, getfn, top, right, bottom, left){
		if(right !== false) right = right || top;
		if(bottom !== false) bottom = bottom || top;
		if(left !== false) left = left || right;

		var restlength = DEFAULT_SPRING_REST_LENGTH,
			strength = DEFAULT_SPRING_STRENGTH;

		var topp = getNodeParticle(getfn, node, top, POS_TOP, POS_BOTTOM);
		var rightp = getNodeParticle(getfn, node, right, POS_RIGHT, POS_LEFT);
		var bottomp = getNodeParticle(getfn, node, bottom, POS_BOTTOM, POS_TOP);
		var leftp = getNodeParticle(getfn, node, left, POS_LEFT, POS_RIGHT);

		var result = [false, false, false, false];

		if(topp) result[0] = particlesystem.makeSpring(particlegroup[POS_TOP], topp, strength, DEFAULT_DRAG, restlength);
		if(rightp) result[1] = particlesystem.makeSpring(particlegroup[POS_RIGHT], rightp, strength, DEFAULT_DRAG, restlength);
		if(bottomp) result[2] = particlesystem.makeSpring(particlegroup[POS_BOTTOM], bottomp, strength, DEFAULT_DRAG, restlength);
		if(leftp) result[3] = particlesystem.makeSpring(particlegroup[POS_LEFT], leftp, strength, DEFAULT_DRAG, restlength);		

		return result;
	},
	'spring-top': function(particlesystem, node, particlegroup, getfn, target, targetside, strength, drag, restlength){
		return springSideHandler(particlesystem, node, particlegroup, getfn, 'top', target, targetside, strength, drag, restlength);
	},
	'spring-bottom': function(particlesystem, node, particlegroup, getfn, target, targetside, strength, drag, restlength){
		return springSideHandler(particlesystem, node, particlegroup, getfn, 'bottom', target, targetside, strength, drag, restlength);
	},
	'spring-left': function(particlesystem, node, particlegroup, getfn, target, targetside, strength, drag, restlength){
		return springSideHandler(particlesystem, node, particlegroup, getfn, 'left', target, targetside, strength, drag, restlength);
	},
	'spring-right': function(particlesystem, node, particlegroup, getfn, target, targetside, strength, drag, restlength){
		return springSideHandler(particlesystem, node, particlegroup, getfn, 'right', target, targetside, strength, drag, restlength);
	}
};

function clearCSSPosition(getfn, selector){
	getfn(selector).forEach(function(item){
		item.style.position = "absolute";
		item.style.left = 0;
		item.style.top = 0;
		item.style.margin = 0;
		item.style.padding = 0;
		item.style.width = 0;
		item.style.height = 0;
	});
}

function dispatch(particlesystem, fns, nodes, declarations, getfn){
	var ks = Object.keys(declarations);
	
	nodes.forEach(function(node){
		var pg = node.pls.particlegroup;

		//Generate node internal box springs
		if(!node.pls.springgroup || node.pls.springgroup.length < 1) {
			node.pls.springgroup = createBoxSpringGroup(particlesystem, pg);
		}

		ks.forEach(function(k){
			if(!fns[k]) return;
			var args = declarations[k].split(' ')
									  .filter(function(x){ return x !== null && x.trim() !== ''; });
			fns[k].apply(null, [particlesystem, node, pg, getfn].concat(args));
		});
	});
}






function applyRuleList(particlesystem, rulelist, fns, getfn){
	var rules = rulelist.filter(function(item){ return item.type === "style"; });

	rules.forEach(function(item){
		//Remove selected elements from css layout
		clearCSSPosition(getfn, item.selector);

		//Execute rulelists against the particlesystem
		dispatch(particlesystem, fns, getfn(item.selector), item.declarations, getfn);
	});
}

//TODO: handle fixed particle movement
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

function updateDOMElement(id){
	var el = document.getElementById(id);
  	var pg = el.pls.particlegroup;
  	var t = pg[POS_TOP].position.y;
  	var l = pg[POS_LEFT].position.x;
  	var w = pg[POS_RIGHT].position.x - pg[POS_LEFT].position.x;
  	var h = pg[POS_BOTTOM].position.y - pg[POS_TOP].position.y;
	
  	el.style.top = t + 'px';
	el.style.left = l + 'px';
  	el.style.width = w + 'px';
  	el.style.height = h + 'px';
}

function updatefn(){
	// TODO: dynamically generate list of updated nodes
	updateDOMElement('item1');
	updateDOMElement('item2');
	updateDOMElement('item3');
}


document.addEventListener('DOMContentLoaded', function(){
  var p = new Physics();
  p.onUpdate(updatefn);
  p.optimize(true);
  p.setEquilibriumCriteria(true, false, false);
  p.onEquilibrium(updatefn);

  // Parse PBPL style sheets
  var styles = Array.prototype.slice.call(document.querySelectorAll("style[type='text/x-pbpl']"));
  styles = styles.reduce(function(a, item){ return a + " " + item.textContent.trim(); }, "");
  var rules = cssparser.parse(styles);

  // Apply PBPL style sheets
  applyRuleList(p, rules.rulelist, declarationHandlers, function(selector){ return getNode(p, selector); });

  // $(window).on('resize', function(){resetDocumentParticleGroup($(document).width(), $(document).height()); p.play(); });

  p.play();	
});

}($));