import React, { useEffect, useState } from 'react';

const App = () => {
  const [sqlQueries, setSqlQueries] = useState([]);
  const [jsonItems, setJsonItems] = useState([]);
  var arraySql = []
  var arrayJSON = []
  const [selectedStyle, setSelectedStyle] = useState(''); // Default to 'font'

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'style-properties') {
        // const styleProperties = message.styleProperties;
        // const sqlQueries = styleProperties.map(generateSQLInsertQuery);
        setSqlQueries(arraySql)
        setJsonItems(arrayJSON)
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up the event listener
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedStyle]);
  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data.pluginMessage;
      console.log('Message from Figma plugin:', message);

      if (message && message.type === 'text-properties') {
        const properties = message.styleProperties;
        const textProperties = properties.map((item) => item.map(generateSQLInsertQuery))
        const jsonProperties = properties.map((item) => item.map(generateJSONItems))
        setSqlQueries(textProperties);
        setJsonItems(jsonProperties)
        console.log(`Text -> properties ${properties}`)
      } else {
        console.error('Received invalid text properties:', message.textProperties);
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up the event listener
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedStyle]);

  const generateSQLInsertQuery = (props) => {
    if (props.theme_id == undefined) {
      return
    } else {
      let query = `INSERT INTO font_style (theme_id, font_style_name, attributes, lang_code) VALUES ('${props.theme_id}', '${props.font_style_name}', '${props.attributes}', '${props.lang_code}');`;
      console.log(`query -> ${query}`)
      setSqlQueries[query]
      arraySql.push(query)
    }
    // return `INSERT INTO font_style (theme_id, font_style_name, attributes, lang_code) VALUES ('${props.theme_id}', '${props.font_style_name}', '${props.attributes}', '${props.lang_code}');`;
  };

  const generateJSONItems = (props) => {
    if (props.theme_id == undefined) {
      return
    } else {
      let query = `${props.attributes}`;
      console.log(`query -> ${query}`)
      setJsonItems[query]
      arrayJSON.push(query)
    }
    // return `INSERT INTO font_style (theme_id, font_style_name, attributes, lang_code) VALUES ('${props.theme_id}', '${props.font_style_name}', '${props.attributes}', '${props.lang_code}');`;
  };

  const clearAll = () => {
    setSqlQueries([])
    setJsonItems([])
  }
  const copyToClipboard = () => {
    const combinedQueries = sqlQueries.join('\n');
    // const combinedJsonItems = jsonItems.join('\n')

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(combinedQueries).then(() => {
        alert('Copied to clipboard!');
      }, (err) => {
        console.log(err)
      });
    } else {
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = combinedQueries;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        alert('Copied to clipboard!');
      } catch (err) {
        console.log(err)
      }

      document.body.removeChild(textArea);
    }
  };

  const handleStyleChange = (event) => {
    setSelectedStyle(event.target.value);
    window.parent.postMessage({ pluginMessage: { type: 'style-change', style: event.target.value } }, '*');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Generate SQL Queries</h2>
      <div>
        <label>
          <input
            type="radio"
            value="color"
            checked={selectedStyle === 'color'}
            onChange={handleStyleChange}
          />
          Color Style
        </label>
        <label>
          <input
            type="radio"
            value="font"
            checked={selectedStyle === 'font'}
            onChange={handleStyleChange}
          />
          Font Style
        </label>
      </div>
      <textarea 
        id='textbox'
        value={sqlQueries.join('\n')}  
        style={{ width: '100%', height: '200px', marginTop: '10px' }}
      />
      <textarea 
        id='textbox2'
        value={jsonItems.join('\n')}  
        style={{ width: '100%', height: '200px', marginTop: '10px' }}
      />
      <button onClick={copyToClipboard} style={{ marginTop: '10px' }}>Copy to Clipboard</button>
      <button onClick={clearAll} style={{ marginTop: '10px' }}>Clear</button>
    </div>
  );
};

export default App;


// import React, { useEffect, useState } from 'react';

// const App = () => {
//   const [sqlQueries, setSqlQueries] = useState([]);

//   useEffect(() => {
//     const handleMessage = (event) => {
//       const message = event.data.pluginMessage;

//       if (message.type === 'text-properties') {
//         const textProperties = message.textProperties;
//         const sqlQueries = textProperties.map(generateSQLInsertQuery);
//         setSqlQueries(sqlQueries);
//       }
//     };

//     window.addEventListener('message', handleMessage);

//     // Clean up the event listener
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   const generateSQLInsertQuery = (props) => {
//     return `INSERT INTO font_style (theme_id, font_style_name, attributes, lang_code) VALUES ('${props.theme_id}', '${props.font_style_name}', '${props.attributes}', '${props.lang_code}');`;
//   };

//   const copyToClipboard = () => {
//     const combinedQueries = sqlQueries.join('\n');

//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       navigator.clipboard.writeText(combinedQueries).then(() => {
//         alert('Copied to clipboard!');
//       }, (err) => {
//         console.log(err)
//       });
//     } else {
//       // Fallback method for older browsers
//       const textArea = document.createElement('textarea');
//       textArea.value = combinedQueries;
//       document.body.appendChild(textArea);
//       textArea.focus();
//       textArea.select();

//       try {
//         document.execCommand('copy');
//         alert('Copied to clipboard!');
//       } catch (err) {
//         console.log(err);
//       }

//       document.body.removeChild(textArea);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Generated SQL Queries</h2>
//       <textarea 
//         value={sqlQueries.join('\n')} 
//         readOnly 
//         style={{ width: '100%', height: '200px' }}
//       />
//       <button onClick={copyToClipboard} style={{ marginTop: '10px' }}>Copy to Clipboard</button>
//     </div>
//   );
// };

// export default App;
