

define('Sankey',['d3'], function (d3) {

return function (instanceData) {
		
	
		var data = { nodes:[],links:[]};
		var currentCategory,currentCategory1=[],i=0;
		var node_arr=[];
		var src,trgt;
		var size_val;
                // Build the tree...
                var series0 = instanceData.series[0];
                for(var j=0;j<series0.length;++j){
					var record_nodes=series0[j];
					node_arr.push(record_nodes.category);
				}
				for(var p=0;p<series0.length;++p){
					var record_nodes1=series0[p];
					node_arr.push(record_nodes1.subcategory);
				}
				
				for(var k=0;k<node_arr.length-1;k++){
					for(var l=k+1;l<node_arr.length;l++){
					if(node_arr[k]>node_arr[l]){
					var temp=node_arr[k];
					node_arr[k]=node_arr[l];
					node_arr[l]=temp;
					}
					}
				}
				for(var index=0; index<node_arr.length;++index){
					if(node_arr[index]!=node_arr[index+1])
						data.nodes.push({ node: i++, name: node_arr[index]});
					
				}
					
				for(var index2=0;index2<series0.length;++index2){
					var record_links=series0[index2];
					for(var index3=0;index3<data.nodes.length;++index3){
						if(record_links.category===data.nodes[index3].name)
							src=data.nodes.indexOf(data.nodes[index3]);
						if(record_links.subcategory===data.nodes[index3].name)
							trgt=data.nodes.indexOf(data.nodes[index3]);
					}
					if(record_links.val==0){
						size_val=0.1;
						}
					else{
						size_val=record_links.val/100;
					}
					data.links.push({ source : src, target : trgt , value : size_val ,d_value: record_links.val});
				}	
				
								
var units = "DEPTH";

var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    width = instanceData.width - margin.left - margin.right,
    height = instanceData.height - margin.top - margin.bottom;

var formatNumber = d3.format("3n"), // zero decimal places
    format = function (d) {
        return units + " " + formatNumber(d);
    },
    color = d3.scale.category20();

// append the svg canvas to the page
var svg = d3.select("#" +instanceData.id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

var defs = svg.append("defs");

// Set the sankey diagram properties
var sankey = d3sankey()
    .nodeWidth(13)
    .nodePadding(24)
    .size([width, height]);

var path = sankey.link();

// load the data
var graph = data;

sankey.nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

// define utility functions
function getLinkID(d){
    return "link-" + d.source.name + "-" + d.target.name;
}
function nodeColor(d) { 
    return d.color = color(d.name.replace(/ .*/, ""));
}

// create gradients for the links

var grads = defs.selectAll("linearGradient")
        .data(graph.links, getLinkID);

grads.enter().append("linearGradient")
        .attr("id", getLinkID)
        .attr("gradientUnits", "objectBoundingBox"); 
                //stretch to fit

grads.html("") //erase any existing <stop> elements on update
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", function(d){
        return nodeColor( (+d.source.x <= +d.target.x)? 
                         d.source: d.target) ;
    });

grads.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", function(d){
        return nodeColor( (+d.source.x > +d.target.x)? 
                         d.source: d.target) 
    });

// add in the links
var link = svg.append("g").selectAll(".link")
    .data(graph.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function(d){
        return "url(#" + getLinkID(d) + ")";
    })
    .style("stroke-opacity", "0.4")
    .on("mouseover", function() { d3.select(this).style("stroke-opacity", "0.7") } )
    .on("mouseout", function() { d3.select(this).style("stroke-opacity", "0.4") } )
    .style("stroke-width", function (d) {
        return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
        return b.dy - a.dy;
    });

// add the link titles
link.append("title")
    .text(function (d) {
        return d.source.name + " → " + d.target.name + "\n" + format(d.d_value);
    });

// add in the nodes
var node = svg.append("g").selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    })
    .call(d3.behavior.drag()
    .origin(function (d) {
        return d;
    })
    .on("dragstart", function () {
        this.parentNode.appendChild(this);
    })
    .on("drag", dragmove));

// add the rectangles for the nodes
node.append("rect")
    .attr("height", function (d) {
        return d.dy;
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) {
        return d.color = color(d.name.replace(/ .*/, ""));
    })
    .style("fill-opacity", ".9")
    .style("shape-rendering", "crispEdges")
    .style("stroke", function (d) {
        return d3.rgb(d.color).darker(2);
    })
    .append("title")
    .text(function (d) {
        return d.name;
    });

// add in the title for the nodes
node.append("text")
    .attr("x", -6)
    .attr("y", function (d) {
        return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("text-shadow", "0 1px 0 #fff")
    .attr("transform", null)
    .text(function (d) {
        return d.name;
    })
    .filter(function (d) {
        return d.x < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

// the function for moving the nodes
function dragmove(d) {
    d3.select(this).attr("transform",
        "translate(" + (
    d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))) + "," + (
    d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
};


function d3sankey() {
    var sankey = {},
        nodeWidth = 20,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    sankey.nodeWidth = function (_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function (_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function (_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function (_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function (_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function (iterations) {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        return sankey;
    };

    sankey.relayout = function () {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function () {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
        }

        link.curvature = function (_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
        nodes.forEach(function (node) {
            node.sourceLinks = [];
            node.targetLinks = [];
        });
        links.forEach(function (link) {
            var source = link.source,
                target = link.target;
            if (typeof source === "number") source = link.source = nodes[link.source];
            if (typeof target === "number") target = link.target = nodes[link.target];
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function (node) {
            node.value = Math.max(
            d3.sum(node.sourceLinks, value),
            d3.sum(node.targetLinks, value));
        });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
        var remainingNodes = nodes,
            nextNodes,
            x = 0;

        while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function (node) {
                node.x = x;
                node.dx = nodeWidth;
                node.sourceLinks.forEach(function (link) {
                    nextNodes.push(link.target);
                });
            });
            remainingNodes = nextNodes;
            ++x;
        }

        //
        moveSinksRight(x);
        scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }

    function moveSourcesRight() {
        nodes.forEach(function (node) {
            if (!node.targetLinks.length) {
                node.x = d3.min(node.sourceLinks, function (d) {
                    return d.target.x;
                }) - 1;
            }
        });
    }

    function moveSinksRight(x) {
        nodes.forEach(function (node) {
            if (!node.sourceLinks.length) {
                node.x = x - 1;
            }
        });
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function (node) {
            node.x *= kx;
        });
    }

    function computeNodeDepths(iterations) {
        var nodesByBreadth = d3.nest()
            .key(function (d) {
            return d.x;
        })
            .sortKeys(d3.ascending)
            .entries(nodes)
            .map(function (d) {
            return d.values;
        });

        //
        initializeNodeDepth();
        resolveCollisions();
        for (var alpha = 1; iterations > 0; --iterations) {
            relaxRightToLeft(alpha *= 0.99);
            resolveCollisions();
            relaxLeftToRight(alpha);
            resolveCollisions();
        }

        function initializeNodeDepth() {
            var ky = d3.min(nodesByBreadth, function (nodes) {
                return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
            });

            nodesByBreadth.forEach(function (nodes) {
                nodes.forEach(function (node, i) {
                    node.y = i;
                    node.dy = node.value * ky;
                });
            });

            links.forEach(function (link) {
                link.dy = link.value * ky;
            });
        }

        function relaxLeftToRight(alpha) {
            nodesByBreadth.forEach(function (nodes, breadth) {
                nodes.forEach(function (node) {
                    if (node.targetLinks.length) {
                        var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedSource(link) {
                return center(link.source) * link.value;
            }
        }

        function relaxRightToLeft(alpha) {
            nodesByBreadth.slice().reverse().forEach(function (nodes) {
                nodes.forEach(function (node) {
                    if (node.sourceLinks.length) {
                        var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedTarget(link) {
                return center(link.target) * link.value;
            }
        }

        function resolveCollisions() {
            nodesByBreadth.forEach(function (nodes) {
                var node,
                dy,
                y0 = 0,
                    n = nodes.length,
                    i;

                // Push any overlapping nodes down.
                nodes.sort(ascendingDepth);
                for (i = 0; i < n; ++i) {
                    node = nodes[i];
                    dy = y0 - node.y;
                    if (dy > 0) node.y += dy;
                    y0 = node.y + node.dy + nodePadding;
                }

                // If the bottommost node goes outside the bounds, push it back up.
                dy = y0 - nodePadding - size[1];
                if (dy > 0) {
                    y0 = node.y -= dy;

                    // Push any overlapping nodes back up.
                    for (i = n - 2; i >= 0; --i) {
                        node = nodes[i];
                        dy = node.y + node.dy + nodePadding - y0;
                        if (dy > 0) node.y -= dy;
                        y0 = node.y;
                    }
                }
            });
        }

        function ascendingDepth(a, b) {
            return a.y - b.y;
        }
    }

    function computeLinkDepths() {
        nodes.forEach(function (node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function (node) {
            var sy = 0,
                ty = 0;
            node.sourceLinks.forEach(function (link) {
                link.sy = sy;
                sy += link.dy;
            });
            node.targetLinks.forEach(function (link) {
                link.ty = ty;
                ty += link.dy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};
}
});