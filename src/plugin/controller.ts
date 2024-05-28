figma.showUI(__html__);

function hasFills(node: SceneNode): node is GeometryMixin & SceneNode {
  return 'fills' in node && !!node.fills;
}

function hasOpacity(node: SceneNode): node is DefaultShapeMixin & SceneNode {
  return 'opacity' in node;
}

function hasStrokes(node: SceneNode): node is GeometryMixin & SceneNode {
  return 'strokes' in node && !!node.strokes;
}

function hasEffects(node: SceneNode): node is RectangleNode  {
  return 'effects' in node;
}

function hasCornerRadius(node: SceneNode): node is (RectangleNode & SceneNode) | (FrameNode & SceneNode) {
  return 'cornerRadius' in node;
}

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'no-selection' });
  } else {
    const node = selection[0];
    let view = {};
    let layer = {};

    if (hasFills(node)) {
      view = {
        backgroundColor: node.fills[0]?.type === 'SOLID' ? `#${Math.floor(node.fills[0].color.r * 255).toString(16)}${Math.floor(node.fills[0].color.g * 255).toString(16)}${Math.floor(node.fills[0].color.b * 255).toString(16)}` : 'none',
        alpha: hasOpacity(node) ? node.opacity : 1,
        clipsToBounds: 'clipsContent' in node ? node.clipsContent : false,
        tintColor: hasStrokes(node) && node.strokes[0]?.type === 'SOLID' ? `#${Math.floor(node.strokes[0].color.r * 255).toString(16)}${Math.floor(node.strokes[0].color.g * 255).toString(16)}${Math.floor(node.strokes[0].color.b * 255).toString(16)}` : null
      };
    }

    if (hasCornerRadius(node) || 'strokeWeight' in node || hasEffects(node)) {
      layer = {
        cornerRadius: hasCornerRadius(node) ? node.cornerRadius : 0,
        shadowColor: hasEffects(node) && node.effects[0]?.type === 'DROP_SHADOW' ? `#${Math.floor(node.effects[0].color.r * 255).toString(16)}${Math.floor(node.effects[0].color.g * 255).toString(16)}${Math.floor(node.effects[0].color.b * 255).toString(16)}` : null,
        shadowOffset: hasEffects(node) && node.effects[0]?.type === 'DROP_SHADOW' ? `{${node.effects[0].offset.x},${node.effects[0].offset.y}}` : null,
        // shadowOpacity: hasEffects(node) && node.effects[0]?.type === 'DROP_SHADOW' ? node.effects[0].opacity : 1,
        shadowRadius: hasEffects(node) && node.effects[0]?.type === 'DROP_SHADOW' ? node.effects[0].radius : 0,
        borderWidth: 'strokeWeight' in node ? node.strokeWeight : 0,
        borderColor: hasStrokes(node) && node.strokes[0]?.type === 'SOLID' ? `#${Math.floor(node.strokes[0].color.r * 255).toString(16)}${Math.floor(node.strokes[0].color.g * 255).toString(16)}${Math.floor(node.strokes[0].color.b * 255).toString(16)}` : 'none',
        opacity: hasOpacity(node) ? node.opacity : 1,
        shouldRasterize: false,
        maskedCorners: null,
        isRadiusByWidth: false,
        isRadiusByPercent: true
      };
    }

    const properties = { view, layer, custom: {} };
    figma.ui.postMessage({ type: 'selection', properties });
    console.log(node)
  }
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};
