/**
 * Created by shuding on 10/11/15.
 * <ds303077135@gmail.com>
 */

// Original author: http://bl.ocks.org/rkirsling/5001347
// Modified by shuding
(function (window, data) {
    var width = 960, height = 500;

    var svg = d3.select('.flow').append('svg').attr('oncontextmenu', 'return false;').attr('width', width).attr('height', height);

    // set up initial nodes and links
    //  - nodes are known by 'id', not by index in array.
    //  - reflexive edges are indicated on the node (as a bold black circle).
    //  - links are always source < target; edge directions are set by 'left' and 'right'.
    var nodes = [], links = [];

    for (var id in data) {
        if (data.hasOwnProperty(id)) {
            nodes.push({
                id:        id,
                reflexive: false
            });
        }
    }

    // init D3 force layout
    var force = d3.layout.force().nodes(nodes).links(links).size([width, height]).linkDistance(150).charge(-600).on('tick', tick);

    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker').attr('id', 'end-arrow').attr('viewBox', '0 -5 10 10').attr('refX', 6).attr('markerWidth', 3).attr('markerHeight', 3).attr('orient', 'auto').append('svg:path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#33C3F0');
    svg.append('svg:defs').append('svg:marker').attr('id', 'start-arrow').attr('viewBox', '0 -5 10 10').attr('refX', 4).attr('markerWidth', 3).attr('markerHeight', 3).attr('orient', 'auto').append('svg:path').attr('d', 'M10,-5L0,0L10,5').attr('fill', '#33C3F0');

    // line displayed when dragging new nodes
    var drag_line = svg.append('svg:path').attr('class', 'link dragline hidden').attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    var path = svg.append('svg:g').selectAll('path'), circle = svg.append('svg:g').selectAll('g');

    // mouse event vars
    var selected_node = null, selected_link = null, mousedown_link = null, mousedown_node = null, mouseup_node = null;

    function resetMouseVars() {
        mousedown_node = null;
        mouseup_node   = null;
        mousedown_link = null;
    }

    // update force layout (called automatically each iteration)
    function tick() {
        // draw directed edges with proper padding from node centers
        path.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x, deltaY = d.target.y - d.source.y, dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY), normX = deltaX / dist, normY = deltaY / dist, sourcePadding = d.left ? 27 : 22, targetPadding = d.right ? 27 : 22, sourceX = d.source.x + (sourcePadding * normX), sourceY = d.source.y + (sourcePadding * normY), targetX = d.target.x - (targetPadding * normX), targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

    // update graph (called when needed)
    function restart() {
        // path (link) group
        path = path.data(links);

        // update existing links
        path.classed('selected', function (d) {
            return d === selected_link;
        }).style('marker-start', function (d) {
            return d.left ? 'url(#start-arrow)' : '';
        }).style('marker-end', function (d) {
            return d.right ? 'url(#end-arrow)' : '';
        });

        // add new links
        path.enter().append('svg:path').attr('class', 'link').classed('selected', function (d) {
            return d === selected_link;
        }).style('marker-start', function (d) {
            return d.left ? 'url(#start-arrow)' : '';
        }).style('marker-end', function (d) {
            return d.right ? 'url(#end-arrow)' : '';
        }).on('mousedown', function (d) {
            if (d3.event.ctrlKey) {
                return;
            }

            // select link
            mousedown_link = d;
            if (mousedown_link === selected_link) {
                selected_link = null;
            } else {
                selected_link = mousedown_link;
            }
            selected_node = null;
            restart();
        });

        // remove old links
        path.exit().remove();

        // circle (node) group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        circle = circle.data(nodes, function (d) {
            return d.id;
        });

        // update existing nodes (reflexive & selected visual states)
        circle.selectAll('circle').style('fill', function (d) {
            return (d === selected_node) ? 'yellow' : '#33C3F0';
        });

        // add new nodes
        var g = circle.enter().append('svg:g');

        g.append('svg:circle').attr('class', 'node').attr('r', 22).style('fill', function (d) {
            return (d === selected_node) ? 'yellow' : '#33C3F0';
        }).on('mouseover', function (d) {
            d3.select(this).attr('transform', 'scale(1.2)');
        }).on('mouseout', function (d) {
            d3.select(this).attr('transform', '');
        }).on('mousedown', function (d) {
            if (d3.event.ctrlKey) {
                return;
            }

            // select node
            mousedown_node = d;
            if (mousedown_node === selected_node) {
                selected_node = null;
            } else {
                selected_node = mousedown_node;
            }
            selected_link = null;

            // reposition drag line
            drag_line.style('marker-end', 'url(#end-arrow)').classed('hidden', false).attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

            restart();
        }).on('mouseup', function (d) {
            if (!mousedown_node) {
                return;
            }

            // needed by FF
            drag_line.classed('hidden', true).style('marker-end', '');

            // check for drag-to-self
            mouseup_node = d;
            if (mousedown_node == mouseup_node) {
                return;
            }

            // unenlarge target node
            d3.select(this).attr('transform', '');

            // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            if (mousedown_node.id < mouseup_node.id) {
                source    = mousedown_node;
                target    = mouseup_node;
                direction = 'right';
            } else {
                source    = mouseup_node;
                target    = mousedown_node;
                direction = 'left';
            }

            var link;
            link = links.filter(function (l) {
                return (l.source === source && l.target === target);
            })[0];

            if (link) {
                link[direction] = true;
            } else {
                link            = {
                    source: source,
                    target: target,
                    lKey:   '',
                    rKey:   '',
                    left:   false,
                    right:  false
                };
                link[direction] = true;
                links.push(link);
            }

            putData();

            // select new link
            selected_link = link;
            selected_node = null;
            restart();
        });

        // show node IDs
        g.append('svg:text').attr('x', 0).attr('y', 4).attr('class', 'id').text(function (d) {
            return data[d.id].title;
        });

        // remove old nodes
        circle.exit().remove();

        // set the graph in motion
        force.start();
    }

    function mousedown() {
        // prevent I-bar on drag
        //d3.event.preventDefault();

        // because :active only works in WebKit?
        svg.classed('active', true);
    }

    function mousemove() {
        if (!mousedown_node) {
            return;
        }

        // update drag line
        drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

        restart();
    }

    function mouseup() {
        if (mousedown_node) {
            // hide drag line
            drag_line.classed('hidden', true).style('marker-end', '');
        }

        // because :active only works in WebKit?
        svg.classed('active', false);

        // clear mouse event vars
        resetMouseVars();

        putData();
    }

    // only respond once per keydown
    var lastKeyDown = -1;

    function keydown() {
        //d3.event.preventDefault();

        if (lastKeyDown !== -1) {
            return;
        }
        lastKeyDown = d3.event.keyCode;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle.call(force.drag);
            svg.classed('ctrl', true);
        }

        if (!selected_node && !selected_link) {
            return;
        }
        switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: // delete
                if (selected_link) {
                    links.splice(links.indexOf(selected_link), 1);
                }
                selected_link = null;
                restart();
                d3.event.preventDefault();
                break;
        }
    }

    function keyup() {
        lastKeyDown = -1;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle.on('mousedown.drag', null).on('touchstart.drag', null);
            svg.classed('ctrl', false);
        }

        putData();
    }

    // app starts here
    svg.on('mousedown', mousedown).on('mousemove', mousemove).on('mouseup', mouseup);
    d3.select(window).on('keydown', keydown).on('keyup', keyup);
    restart();

    var dataTable = window.document.getElementsByClassName('data-table')[0];
    var linkData;

    function getLinkData(id, dir) {
        if (!linkData[id]) {
            return '';
        }
        var ret = [];
        if (dir == 1) {
            linkData[id].next.forEach(function (nid) {
                ret.push('<div>' + data[nid].title + '</div>');
            });
        } else {
            linkData[id].prev.forEach(function (nid) {
                ret.push('<div>' + data[nid].title + '</div>');
            });
        }
        return ret.join('');
    }

    function parseLink(link) {
        if (!linkData[link.source.id]) {
            linkData[link.source.id] = {
                prev: [],
                next: []
            };
        }
        if (!linkData[link.target.id]) {
            linkData[link.target.id] = {
                prev: [],
                next: []
            };
        }
        if (link.right) {
            linkData[link.source.id].next.push(link.target.id);
            linkData[link.target.id].prev.push(link.source.id);
        }
        if (link.left) {
            linkData[link.source.id].prev.push(link.target.id);
            linkData[link.target.id].next.push(link.source.id);
        }
    }

    function putData() {
        linkData = {};

        var html = '<table class="u-full-width"><thead><tr>';

        if (selected_link) {
            html += '<th>From</th><th>Key</th><th>To</th></thead><tbody>';

            console.log(selected_link);
            if (selected_link.left) {
                html += '<tr><td>' + data[selected_link.target.id].title + '</td>';
                html += '<td><input class="key" type="text" value="' + selected_link.lKey + '"></td>';
                html += '<td>' + data[selected_link.source.id].title + '</td></tr>';
            }
            if (selected_link.right) {
                html += '<tr><td>' + data[selected_link.source.id].title + '</td>';
                html += '<td><input class="key" type="text" value="' + selected_link.rKey + '"></td>';
                html += '<td>' + data[selected_link.target.id].title + '</td></tr>';
            }

            html += '</tbody></table>';
        } else if (selected_node) {
            links.forEach(parseLink);

            html += '<th>Quiz</th><th>Previous</th><th>Next</th></tr></thead><tbody><tr>';
            html += '<td><a href="/admin/quizzes/' + selected_node.id + '">' + data[selected_node.id].title + '</a></td>';
            html += '<td>' + getLinkData(selected_node.id, -1) + '</td>';
            html += '<td>' + getLinkData(selected_node.id, 1) + '</td>';
            html += '</tr></tbody></table>';
        }
        dataTable.innerHTML = html;
    }
})(window, data);
