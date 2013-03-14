/*
 *
 *	QuickBox (Another Lightbox clone)
 *
 *	Version: 1.0
 *	Documentation: AndrewPlummer.com (http://www.andrewplummer.com/code/quickbox/)
 *	Heavily inspired by: Slimbox by Christophe Beyls (http://www.digitalia.be)
 *	Written for: Mootools 1.2
 *	License: MIT-style License
 *	
 *	Copyright (c) 2008 Andrew Plummer
 *
 *
 */


var QuickBox = new Class({


	Implements: Options,

	options: {
		resizeDuration: 600,
		resizeTransition: Fx.Transitions.Circ.easeOut,
		initialWidth: 250,
		initialHeight: 250,
		padding: 10,
		animateCaption: true,
		counter: "Image {NUM} of {TOTAL}"
	},

	initialize: function(options){
	

		this.setOptions(options);
		this.anchors = $$("a[rel=quickbox]");
		this.anchors.each(function(a){
			a.store("caption", a.get("title") || a.getElement("img").get("alt"));
			a.addEvent("click", this.open.bindWithEvent(this, a));
		}, this);
		
		
		this.overlay = new Element("div", {
			id: "qbOverlay",
			events: {
				click: this.close.bindWithEvent(this)
			}
		}).inject(document.body, "top");
		
		this.quickBox = new Element("div", {
			id: "qbBox",
			styles: {
				width: this.options.initialWidth,
				height: this.options.initialHeight,
				marginLeft: -(this.options.initialWidth/2),
				position: "absolute"
			}
		}).inject(document.body, "top");
		
		this.prevLink = new Element("a", {id: "qbPrev", href: "#"}).inject(this.quickBox);		
		this.nextLink = this.prevLink.clone().setProperty("id", "qbNext").injectInside(this.quickBox);
		
		this.stage = new Element("div", {id: "qbStage"}).inject(this.quickBox);
		
		this.prevLink.addEvent("click", this.changeImage.bindWithEvent(this, -1));
		this.nextLink.addEvent("click", this.changeImage.bindWithEvent(this, 1));

		this.bottom = new Element("div", {id: "qbBottom"}).inject(this.quickBox);
		
		this.closeButton = new Element("div", {
			id: "qbClose",
			events: {
				click: this.close.bindWithEvent(this)
			}
		}).inject(this.bottom);
		
		this.caption = new Element("div", {id: "qbCaption"}).inject(this.bottom);
		this.counter = new Element("div", {id: "qbCounter"}).inject(this.bottom);
				
		var nextEffect = this.nextEffect.bind(this);
		
		this.fx = {
			overlay: new Fx.Tween(this.overlay, {
				property: "opacity"
			}),
			resize: new Fx.Morph(this.quickBox, {
				duration: this.options.resizeDuration,
				transition: this.options.resizeTransition,
				onComplete: nextEffect
			}),
			
			show: new Fx.Tween(this.stage, {
				property: "opacity",
				onComplete: nextEffect
			}),
			bottom: new Fx.Tween(this.bottom, {
				property: "top",
				duration: 400,
				onComplete: nextEffect
			})
		};

		this.active = false;
		document.addEvent("mousewheel", this.mouseWheelListener.bindWithEvent(this));
		document.addEvent("keydown", this.keyboardListener.bindWithEvent(this));
				
	},

	open: function(event, link){
	
		this.active = true;
						
		var size = window.getSize();
		var scroll = window.getScroll();
		var scrollSize = window.getScrollSize();
		
		/* The images should be 640x480(max). They're easily clipped at 1024x768,
		 * so we get them as close as possible to the top of the window. */
		var offset = Math.round((size.y < 768) ? size.y / 36 : size.y / 10);
		
		var top = scroll.y + offset;
		
		this.overlay.setStyles({
			opacity: 0,
			display: "block",
			width: scrollSize.x,
			height: scrollSize.y
		});
		this.quickBox.setStyles({
			display: "block",
			top: top
		});
		this.fx.overlay.start(0.8);
		this.startLoad(link);
		return false;
	},
	
	startLoad: function(link, preload){
	
		if(!link) return;
		var image = new Asset.image(link.get("href"), {
			onload: function(){
				if(!preload && this.currentLink == link) this.nextEffect();
			}.bind(this)
		});
		if(!preload){
			this.stage.addClass("loading");
			this.stage.setStyle("display", "block");
			this.stage.empty();
			this.bottom.setStyle("opacity", 0);
			this.prevLink.setStyle("display", "none");
			this.nextLink.setStyle("display", "none");
			this.currentLink = link;
			this.currentCaption = link.retrieve("caption");
			this.currentImage = image;
			this.currentIndex = this.anchors.indexOf(link);
			this.step = 1;
		}
	},

	keyboardListener: function(event){
		if(!this.active) return;
		if(event.key != "f5") event.preventDefault();
		switch (event.key){
			case "esc": case "x": case "q": this.close(); break;
			case "b": case "p": case "left": this.changeImage(event, -1); break;	
			case "f": case "n": case "right": this.changeImage(event, 1);
		}
	},


	mouseWheelListener: function(event){
		if(!this.active) return;
		if(event.wheel > 0) this.changeImage(event, -1);
		if(event.wheel < 0) this.changeImage(event, 1);
	},

	changeImage: function(event, step){
	
		event.preventDefault();
		var link = this.anchors[this.currentIndex+step];
		if(!link) return false;
		for(var f in this.fx) this.fx[f].cancel();
		this.startLoad(link);
	},
	
	nextEffect: function(){
	
		switch(this.step++){
		
			case 1:
				var w = this.currentImage.width + this.options.padding * 2;
				var h = this.currentImage.height + this.options.padding * 2;
				this.prevLink.setStyle("height", h);
				this.nextLink.setStyle("height", h);
				this.fx.resize.start({
					width: w,
					height: h,
					marginLeft: -(this.currentImage.width/2)
				});
				break;
			case 2:
			
				this.stage.removeClass("loading");
				this.stage.setStyle("opacity", 0);
				this.currentImage.setStyle("margin", this.options.padding);
				this.currentImage.inject(this.stage);
				this.fx.show.start(1);
				break;
			case 3:
			
				this.prevLink.setStyle("display", "block");
				this.nextLink.setStyle("display", "block");
				if(this.options.animateCaption){
					if(this.options.counter){
						var total = this.anchors.length;
						var num = this.currentIndex + 1;
						var counterText = this.options.counter;
						counterText = counterText.replace(/\{NUM\}/, num);
						counterText = counterText.replace(/\{TOTAL\}/, total);
						this.counter.set("text", counterText);
					}
					this.caption.set("text", this.currentCaption);
					var height = this.bottom.getStyle("height").toInt();
					this.bottom.setStyles({
						opacity: 1,
						top: -height
					});
					this.fx.bottom.start(0);
				}
				break;
			case 4:
				this.startLoad(this.anchors[this.currentIndex-1], true);
				this.startLoad(this.anchors[this.currentIndex+1], true);
				break;
		}
	},

	close: function(){
		this.quickBox.setStyle("display", "none");
		this.overlay.fade("out");
		this.active = false;
	}
});

