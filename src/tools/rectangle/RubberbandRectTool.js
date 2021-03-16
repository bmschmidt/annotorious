import RubberbandRect from './RubberbandRect';
import EditableRect from './EditableRect';
import Tool from '../Tool';

/**
 * A rubberband selector for rectangle fragments.
 */
export default class RubberbandRectTool extends Tool {

  constructor(g, config, env) {
    // Most of the basics are handled in the Tool base class
    super(g, config, env);

    this.rubberband = null;
  }

  startDrawing = (x, y) => {
    this.attachListeners({
      mouseMove: this.onMouseMove,
      mouseUp: this.onMouseUp
    });

    this.rubberband = new RubberbandRect(x, y, this.g, this.env);
  }

  stop = () => {
    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;
    }
  }

  onMouseMove = (x, y) => {
    this.rubberband.dragTo(x, y);
  }
  
  onMouseUp = () => {
    this.detachListeners();

    const { w } = this.rubberband.bbox;

    if (w > 3) {
      // Emit the SVG shape with selection attached    
      const { element } = this.rubberband;
      element.annotation = this.rubberband.toSelection();

      // Emit the completed shape...
      this.emit('complete', element);
    } else {
      this.emit('cancel');
    }

    this.stop();
  }

  createEditableShape = annotation =>
    new EditableRect(annotation, this.g, this.config, this.env);

  get isDrawing() {
    return this.rubberband != null;
  }

  get supportsModify() {
    return true;
  }

}

RubberbandRectTool.identifier = 'rect';

RubberbandRectTool.supports = annotation => {
  const fragmentSelector = annotation.selector('FragmentSelector');
  return fragmentSelector?.conformsTo.startsWith('http://www.w3.org/TR/media-frags');
}