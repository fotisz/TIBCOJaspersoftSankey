({
    //optimize: 'none', // Uncomment this property to disable the uglify of the libraries
    baseUrl: '',
    paths: {
			'd3': 'd3.min' , 		
			'Sankey': 'Sankey' ,
			'Sankey1' : 'Sankey1'
	}, 
	/*	shim: {
    	'Sankey' : {
    		deps: ["Sankey1"],
    		exports: 'Sankey'
    	}
    },*/
	/*	wrap: {
        start: "if (typeof define === 'function' && define.amd){}\nelse if (typeof __visualize__ !== 'undefined' &&\ntypeof __visualize__.define === 'function')\n{\n}\n\n(function(root){\n\nvar define = root.define;\n\n",
        end: "\n\n}(typeof __visualize__ != 'undefined' ? __visualize__ : window));"
    },*/
    
    name: "Sankey",
    out: "Sankey.min.js"
})
