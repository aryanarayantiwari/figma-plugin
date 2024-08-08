figma.showUI(__html__, { width: 600, height: 600 });

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

function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

const colors = {
  systemWhite: 'System White',
  brandPrimary: 'Brand Primary',
  brandSecondary: 'Brand Secondary'
};

const alignments = ['left', 'center', 'right'];

function getTextProperties(node: TextNode) {
  const fills = node.fills as Paint[];
  const fill = fills[0];
  const baseFontName = node.name.trim().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

  const baseProperties = {
    id: node.id,
    theme_id: '5', // Placeholder, replace with actual theme_id as needed
    font_size: node.fontSize,
    baseColor: fill.type === 'SOLID' ? `#${Math.floor(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.b * 255).toString(16).padStart(2, '0')}` : null,
    letterSpacing: node.letterSpacing.valueOf,
    lineHeight: node.lineHeight.valueOf
  };

  return alignments.flatMap(alignment => {
    return Object.entries(colors).map(([colorName, colorValue]) => {
      return {
        id: baseProperties.id,
        theme_id: baseProperties.theme_id,
        font_style_name: `${camelize(baseFontName)}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
        attributes: JSON.stringify({
          font_size: baseProperties.font_size,
          font_color: colorValue,
          textAlignment: alignment,
          letterSpacing: baseProperties.letterSpacing,
          lineHeight: baseProperties.lineHeight
        }),
        lang_code: 'en'
      };
    });
  });
}

function camelize(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}



// function getTextProperties(node: TextNode) {
//   const fills = node.fills as Paint[];
//   const fill = fills[0];
//   return {
//     id: node.id,
//     theme_id: '5', // Placeholder, replace with actual theme_id as needed
//     font_style_name: node.name.trim().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''),
//     attributes: JSON.stringify({
//       font_size: node.fontSize,
//       font_color: fill.type === 'SOLID' ? `#${Math.floor(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.b * 255).toString(16).padStart(2, '0')}` : null,
//       textAlignment: node.textAlignHorizontal.toLowerCase(),
//       letterSpacing: node.letterSpacing.valueOf,
//       lineHeight: node.lineHeight.valueOf
//     }),
//     lang_code: 'en'
//   };
// }

function getColorProperties(node: SceneNode) {
  let view = {};
  let layer = {};
  let custom = {};

    if (hasFills(node)) {
      view = {
        backgroundColor: node.fills[0]?.type === 'SOLID' ? `#${Math.floor(node.fills[0].color.r * 255).toString(16)}${Math.floor(node.fills[0].color.g * 255).toString(16)}${Math.floor(node.fills[0].color.b * 255).toString(16)}` : null,
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
        borderColor: hasStrokes(node) && node.strokes[0]?.type === 'SOLID' ? `#${Math.floor(node.strokes[0].color.r * 255).toString(16)}${Math.floor(node.strokes[0].color.g * 255).toString(16)}${Math.floor(node.strokes[0].color.b * 255).toString(16)}` : null,
        opacity: hasOpacity(node) ? node.opacity : 1,
        shouldRasterize: false,
        maskedCorners: null,
        isRadiusByWidth: node.type === 'RECTANGLE' && (typeof(node.cornerRadius) == "number" && node.cornerRadius.valueOf() > 20) ? false : true,
        isRadiusByPercent: node.type === 'RECTANGLE' && (typeof(node.cornerRadius) == "number" && node.cornerRadius.valueOf() > 20) ? true : false
      };
    }

    if (hasFills(node)) {
        let startPoint = { x:  node.fills[0].gradientTransform[0][2], y: node.fills[0].gradientTransform[1][2] };
        let endPoint = {
          x: node.fills[0].gradientTransform[0][0] + node.fills[0].gradientTransform[0][2],
          y: node.fills[0].gradientTransform[1][1] + node.fills[0].gradientTransform[1][2]
        };
        startPoint.x = roundToTwoDecimals(startPoint.x)
        startPoint.y = roundToTwoDecimals(startPoint.y)
        endPoint.x = roundToTwoDecimals(endPoint.x)
        endPoint.y = roundToTwoDecimals(endPoint.y)
      custom  = {
        gradient: {
          gradientColors: node.fills[0].gradientStops.map(item => `#${Math.floor(item.color.r * 255).toString(16)}${Math.floor(item.color.g * 255).toString(16)}${Math.floor(item.color.b * 255).toString(16)}`),
          gradientLocations: node.fills[0].gradientStops.map(item => item.position),
          startPoint: startPoint,
          endPoint:endPoint
        }
      };
    }
    return {
      id: node.id,
      theme_id: '5', // Placeholder, replace with actual theme_id as needed
      color_style_name: node.name.trim().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''),
      attributes: JSON.stringify({
        view,
        layer,
        custom
      }),
      lang_code: 'en'
    };
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'style-change') {
    const selection = figma.currentPage.selection;
    let styleProperties = [];

    if (msg.style === 'font') {
      if (selection[0].type === 'FRAME') {
        styleProperties = selection[0].children.filter(node => node.type === 'TEXT').map(node => getTextProperties(node as TextNode));
      } 
      else {
        styleProperties = selection.filter(node => node.type === 'TEXT').map(node => getTextProperties(node as TextNode));
        console.log(typeof(styleProperties))
      }
      figma.ui.postMessage({ type: 'text-properties', styleProperties });
      } else if (msg.style === 'color') {
      styleProperties = selection.filter(node => node.type === 'FRAME').map(getColorProperties);
    }

    figma.ui.postMessage({ type: 'style-properties', styleProperties });
  }

  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// figma.showUI(__html__, { width: 600, height: 600 });

// function traverseNode(node: SceneNode, textNodes: TextNode[] = []): TextNode[] {
//   if (node.type === 'TEXT') {
//     textNodes.push(node);
//   } else if ('children' in node) {
//     for (const child of node.children) {
//       traverseNode(child, textNodes);
//     }
//   }
//   return textNodes;
// }

// figma.on('selectionchange', () => {
//   const selection = figma.currentPage.selection;

//   if (selection.length === 0) {
//     figma.ui.postMessage({ type: 'no-selection' });
//   } else {
//     const textNodes = selection.flatMap(node => traverseNode(node));

//     const colors = {
//       systemWhite: 'System White',
//       brandPrimary: 'Brand Primary', // Replace with actual Brand Primary color
//       brandSecondary: 'Brand Secondary' // Replace with actual Brand Secondary color
//     };

//     const alignments = ['left', 'center', 'right'];

//     const textProperties = textNodes.flatMap(node => {
//       const fontName = node.name.trim().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
//       const baseFontName = camelize(fontName);
//       // const fills = node.fills as Paint[];
//       // const fill = fills[0];
//       // const baseColor = fill.type === 'SOLID' ? `#${Math.floor(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.b * 255).toString(16).padStart(2, '0')}` : null;

//       return alignments.flatMap(alignment => {
//         return Object.entries(colors).map(([colorName, colorValue]) => {
//           return {
//             id: node.id,
//             theme_id: '5', // Placeholder, replace with actual theme_id as needed
//             font_style_name: `${baseFontName}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
//             attributes: JSON.stringify({
//               font_size: node.fontSize,
//               font_color: colorValue,
//               textAlignment: alignment,
//               letterSpacing: node.letterSpacing.valueOf,
//               lineHeight: node.lineHeight.valueOf
//             }),
//             lang_code: 'en'
//           };
//         });
//       });
//     });

//     figma.ui.postMessage({ type: 'text-properties', textProperties });
//   }
// });

// figma.ui.onmessage = (msg) => {
//   if (msg.type === 'close-plugin') {
//     figma.closePlugin();
//   }
// };

// // Helper function to camelCase the font style name
// function camelize(str: string): string {
//   return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
//     if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
//     return index === 0 ? match.toLowerCase() : match.toUpperCase();
//   });
// }
