(function($){
  $.draggableSort = function(el, selection, options){
    var base = this;

    base.$el = $(el);
    base.el = el;
    base.selection = selection;

    base.$el.data("draggableSort", base);

    // private helper functions
    function getPos(order) {
      var pos_left = (order % base.options.columns) * base.options.col_width,
          pos_top = Math.floor(order/base.options.columns) * base.options.col_height;
      return {'top': pos_top, 'left': pos_left };
    }
    
    function setGridPos(el, order) {
      var abs_pos = getPos(order);
      TweenLite.set(el, {
        'top': abs_pos.top + 'px',
        'left': abs_pos.left + 'px'
      });
    }

    function animateToOrder(el, order) {
      var new_pos = getPos(order);
      //animate to new order
      TweenMax.to(el, 0.2, {
        top: new_pos.top,
        left: new_pos.left,
        ease: Power2.easeInOut
      });
    }
    function updateOrder(active, target) {
      var active_order = active.dataset.order,
          target_order = target.dataset.order,
          i = base.selection.length;

      // if the active box is moving up, animate others down
      if(active_order > target_order) {
        // loop through boxes
        while (--i > -1) {
          var el = base.selection[i],
              order = parseInt(el.dataset.order, 10);
          if(order < active_order && order >= target_order) {
            el.dataset.order = order + 1;
            animateToOrder(el, order + 1);
          }
        }
      }
      // else if the active box is moving down, animate others up
      else {
        while (--i > -1) {
          var el = base.selection[i],
              order = parseInt(el.dataset.order, 10);
          if(order > active_order && order <= target_order) {
            el.dataset.order = order - 1;
            animateToOrder(el, order - 1);
          }
        }
      }
      // set active order to be target order
      active.dataset.order = target_order;
    }

    function setParentHeight() {
      var height = Math.ceil(base.selection.length/base.options.columns) * base.options.col_height;
      console.log(height);
      //base.$el.parent.height(height);
    }

    // initialize
    base.init = function(){

      base.options = $.extend({},$.draggableSort.defaultOptions, options);
      
      setGridPos(base.el, el.dataset.order);
      //setParentHeight();

      var overlapThreshold = "50%";

      // destroy any previous draggables on base.el
      var cur_draggable = Draggable.get(base.el);
      if(cur_draggable) cur_draggable.kill();
      
      // set up draggable instance
      Draggable.create(base.el, {
        type: "top,left",
        trigger: base.$el.find(base.options.trigger),
        bounds: base.$el.parent(base.options.bounds),
        edgeResistance:0.5,
        onDrag: function(e) {
          var i = base.selection.length;
          while (--i > -1) {
            if (!TweenMax.isTweening(base.selection) && this.hitTest(base.selection[i], overlapThreshold)) {
              updateOrder(this.target, base.selection[i]);
            }
          }
        },
        onDragEnd:function(e) {
          var el = this.target;
          animateToOrder(el, el.dataset.order);
          base.options.on_drop();
        }
      });

    };

    base.init();
  };

  $.draggableSort.defaultOptions = {
    bounds: '.drag-bounds',
    trigger: '.drag-trigger',
    columns: 4,
    col_width: 200,
    col_height: 100,
    on_drop: function() {}
  };

  $.fn.draggableSort = function(options){
    var selection = this;
    $(this).parent(options.bounds).height(Math.ceil(this.length/options.columns) * options.col_height);

    return this.each(function(){
      (new $.draggableSort(this, selection, options));
    });
  };
    
})(jQuery);