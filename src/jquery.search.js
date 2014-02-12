/*
 
highlight v3 
    - Modified by Marshal (beatgates@gmail.com) to add regexp highlight, 2011-6-24
    - Modified by Galindus (galindus@gmail.com) to support Deferred.
 
Highlights arbitrary terms.
 
<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>
 
MIT license.
 
Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>
 
*/

jQuery.fn.highlight = function (pattern) {
    var regex = typeof (pattern) === "string" ? new RegExp(pattern, "i") : pattern; // assume very LOOSELY pattern is regexp if not string
    var deferred = new jQuery.Deferred();
    var items = 0;
    var matches = [];
    function innerHighlight(node, pattern) {
        skip = 0;
        items++;
        if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) { // 1 - Element node
            for (var i = 0; i < node.childNodes.length; i++) { // highlight all children                
                i += innerHighlight(node.childNodes[i], pattern); // skip highlighted ones
            }
            
        }else if (node.nodeType === 3) { // 3 - Text node
            var pos = node.data.search(regex);
            if (pos >= 0 && node.data.length > 0) { // .* matching "" causes infinite loop
                var match = node.data.match(regex); // get the match(es), but we would only handle the 1st one, hence /g is not recommended
                var spanNode = document.createElement('span');
                spanNode.className = 'highlight'; // set css
                var middleBit = node.splitText(pos); // split to 2 nodes, node contains the pre-pos text, middleBit has the post-pos
                var endBit = middleBit.splitText(match[0].length); // similarly split middleBit to 2 nodes
                var middleClone = middleBit.cloneNode(true);
                spanNode.appendChild(middleClone);
                // parentNode ie. node, now has 3 nodes by 2 splitText()s, replace the middle with the highlighted spanNode:
                middleBit.parentNode.replaceChild(spanNode, middleBit)
                matches.push(node.nextSibling);
                skip = 1;
            }
        }
        items--;
        return skip;
    }

    var interval = setInterval(function () {
        if (items == 0) {
            clearInterval(interval);
            if (matches.length > 0) {
                deferred.resolve(matches);
            } else {
                deferred.reject();
            }
        }
    }, 2);
    
    this.each(function (index, elm) {        
        innerHighlight(this, pattern, deferred);
    });

    return deferred.promise();
    
};

jQuery.fn.removeHighlight = function () {
    return this.find("span.highlight").each(function () {
        this.parentNode.firstChild.nodeName;
        with (this.parentNode) {
            replaceChild(this.firstChild, this);
            normalize();
        }
    }).end();
};