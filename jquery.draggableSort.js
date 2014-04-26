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

    // initialize
    base.init = function(){

      base.options = $.extend({},$.draggableSort.defaultOptions, options);

      var overlapThreshold = "50%";

      Draggable.create(base.el, {
        type: "top,left",
        trigger: base.$el.find('.drag-trigger'),
        bounds: base.$el.parent('.section-inner'),
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
    col_height: 100
  };

  $.fn.draggableSort = function(options){
    var selection = this;
    return this.each(function(){
      (new $.draggableSort(this, selection, options));
    });
  };
    
})(jQuery);