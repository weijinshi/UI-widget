(function($, undefined) {
    'use strict';

    var pluginName = 'treeview';
    var pluginGlobal = {
        _template: {
            controlDiv: '<div class="controlDiv treeview-control"></div>',
            list: '<ul class="tree-node-group"></ul>',
            item: '<li class="tree-node"></li>',
            indent: '<span class="indent"></span>',
            foldedIcon: '<span class="folded" role="folded"></span>',
            unfoldedIcon: '<span class="unfolded" role="folded"></span>',
            leafNode: '<li class="tree-leaf"></li>',
            leafAddBtn: '<a><span class="icon icon-add"></span>Add Organization Structure</a>',
        }
    };

    var Tree = Class.extend({
        _element: undefined,
        _elementId: undefined,
        _styleId: undefined,
        $element: null,
        $wrapper: null,
        $controlDiv: null,
        data: null,
        controlDiv: null,
        initialized: false,
        nodes: null,
        selectedNode: null,

        ctor: function(element, options) {
            this.$element = $(element);
            this._element = element;
            this._elementId = this._element.id;
            this._styleId = this._elementId + '-style';
            this.nodes = [];
            this._init(options);
        },
        getSelectedNode: function() {
            var self = this;

            var node = $('.tree-node.selected');
            if (!node || node.length == 0) {
                return self.data;
            }
            var nodeId = node.attr('data-id');
            return self.findNodeById(nodeId);
        },
        remove: function() {
            this._destroy();
            $.removeData(this, 'plugin_' + pluginName);
            this.$element.empty();
        },
        setData: function(data) {
            var self = this;
            self.data = data || self.data;
            if (self.data) {
                self.data.isRootNode = true;
            }
            self._preProcessData(self.data);
            self._render();
        },
        updateNode: function(newNode) {
            var self = this;
            self._recursionUpdateNode(self.data, newNode);
            self._render();
        },
        findNodeById: function(nodeid) {
            var self = this;
            return self._findNodeById(nodeid, self.data);
        },
        _preProcessData: function(node) {
            var self = this;

            if (!node) return;

            if (node.Children) {
                $.each(node.Children, function(id, cnode) {
                    self._preProcessData(cnode);
                });
            }

            // leaf node
            if (self.options.hasAddNodeInLeaf) {
                var leafNode = new Object();
                leafNode.Id = '-1';
                leafNode.parentId = node.Id;
                if (!node.Children) {
                    node.Children = [];
                }
                node.Children.push(leafNode);
            }

            if (!node.isRootNode) {
                self._toggleNodes(node);
            }
        },
        _recursionUpdateNode: function(node, newNode) {
            var self = this;

            if (!node) return;

            if (node.Id === newNode.Id) {
                node = newNode;
                return;
            }

            if (node.Children) {
                $.each(node.Children, function(id, cnode) {
                    self._recursionUpdateNode(cnode, newNode);
                });
            }
        },
        _bindDefaultEvent: function() {
            var self = this;

            self._bindControl();
            self._bindSelected();
            self._bindFolded();
            if (self.options.hasAddNodeInLeaf) {
                self._bindLeafNodeClick();
            }
        },
        _bindControl: function() {
            var self = this;
            if (!self.controlDiv) return;
            var buttons = self.controlDiv.buttons;
            for (var i in buttons) {
                var controlName = buttons[i].name;
                var callback = buttons[i].callback;
                self.$controlDiv.find('[control-name="' + controlName + '"]').on(
                    'click',
                    { callback: callback },
                    function(e) {
                        if ($(this).attr('disabled') != 'disabled') {
                            var callback = e.data.callback;
                            callback(self);
                            return false;
                        }
                    }
                );
            }
        },
        _bindSelected: function() {
            var self = this;
            self.$wrapper.find('.tree-node').on('click', function(e) {
                self.$wrapper.find('.tree-node').removeClass('selected');
                $(this).addClass('selected');
            });
            if (self.options.onNodeSelected && typeof(self.options.onNodeSelected) === 'function') {
                self.$wrapper.find('.tree-node').on(
                    'click',
                    { callback: self.options.onNodeSelected },
                    function(e) {
                        var id = $(this).attr('data-id');
                        var node = self._findNodeById(id, self.data);
                        self.selectedNode = node;
                        var callback = e.data.callback;
                        callback(node);
                        return false;
                    }
                );
            }
        },
        _bindLeafNodeClick: function() {
            var self = this;
            if (self.options.leafNodeClick && typeof(self.options.leafNodeClick) === 'function') {
                self.$wrapper.find('.tree-leaf').on(
                    'click',
                    { callback: self.options.leafNodeClick },
                    function(e) {
                        var parentId = $(this).attr('data-parentid');
                        var parentNode = self._findNodeById(parentId, self.data);
                        var callback = e.data.callback;
                        callback(parentNode);
                        return false;
                    }
                );
            }
        },
        _bindFolded: function() {
            var self = this;
            self.$wrapper.find('[role="folded"]').on('click', function(e) {
                var node = self._findNode($(this));
                self._toggleNodes(node);
                self._render();
            });
        },
        _build: function() {
            var self = this;
            self._buildControlDiv();
            self.$element.append(self.$wrapper.empty());
            self.nodes = [];
            self._buildTree(self.data, 0);
        },
        _buildControlDiv: function() {
            var self = this;
            if (self.options.controlDiv && self.options.controlDiv.display) {
                if (self.options.controlDiv.buttons) {
                    self.$controlDiv = $(pluginGlobal._template.controlDiv);
                    for (var index in self.options.controlDiv.buttons) {
                        var btn = self.options.controlDiv.buttons[index];
                        var controlBtn = '<a href="#" class="controlBtn" control-name="' + btn.name + '"><span class="' + btn.icon + '"></span><span>' + btn.displayName + '</span></a>';
                        self.$controlDiv.append(controlBtn);
                    }
                }
                self.$element.append(self.$controlDiv);
            }
        },
        _buildTree: function(node, level) {
            var self = this;

            if (!node) {
                return;
            }
            level += 1;

            node.nodeId = self.nodes.length;
            self.nodes.push(node);

            // leaf node
            if (node.Id == -1) {
                var treeLeaf = $(pluginGlobal._template.leafNode)
                    .attr('data-nodeid', node.nodeId)
                    .attr('data-id', node.Id)
                    .attr('data-parentid', node.parentId);
                for (var i = 0; i < (level - 2); i++) {
                    var $indent = $(pluginGlobal._template.indent);
                    treeLeaf.append($indent);
                }
                treeLeaf.append($(pluginGlobal._template.leafAddBtn));
                self.$wrapper.append(treeLeaf);
                return;
            }

            var treeItem = $(pluginGlobal._template.item)
                .attr('data-nodeid', node.nodeId)
                .attr('data-id', node.Id);
            if (self.selectedNode && node.Id == self.selectedNode.Id) {
                treeItem.addClass('selected');
            }

            for (var i = 0; i < (level - 2); i++) {
                var $indent = $(pluginGlobal._template.indent);
                treeItem.append($indent);
            }

            // inherit icon
            if (self.options.hasInherit) {
                var $inheritIcon = $(pluginGlobal._template.indent);
                if (!node.isRootNode && node.notInherit) {
                    $inheritIcon.addClass(self.options.notInheritIcon).addClass('indent-inherit');
                }
                treeItem.append($inheritIcon);
            }

            // folded icon
            if (!(node.nodeId == 0 && !self.options.rootFoldable)) {
                var $foldedIcon = $(pluginGlobal._template.indent);
                if (node.folded === true) {
                    $foldedIcon.attr('role', 'folded').addClass(self.options.foldedIcon);
                } else if (node.folded === false) {
                    $foldedIcon.attr('role', 'folded').addClass(self.options.unfoldedIcon);
                }
                treeItem.append($foldedIcon);
            }

            treeItem.append(node.Name);

            self.$wrapper.append(treeItem);

            if (node.Children) {
                $.each(node.Children, function(id, node) {
                    self._buildTree(node, level);
                });
            }
        },
        _emptyTree: function() {
            var self = this;
            self.$wrapper.empty();
        },
        _destroy: function() {
            var self = this;
            if (self.initialized) {
                _unbindAll(self);
                self.$controlDiv.remove();
                self.$controlDiv = null;
                self.$wrapper.remove();
                self.$wrapper = null;
            }
            self.initialized = false;

            function _unbindAll(self) {
                var self = self || this;
                self.$controlDiv.off();
                self.$wrapper.off();
            }
        },

        _init: function(options) {
            var self = this;
            if (options.data) {
                if (typeof options.data === 'string') {
                    options.data = $.parseJSON(options.data);
                }
                self.data = $.extend(true, null, options.data);
                if (self.data) {
                    self.data.isRootNode = true;
                }
                delete options.data;
            }
            if (options.controlDiv) {
                if (typeof options.controlDiv === 'string') {
                    options.controlDiv = $.parseJSON(options.controlDiv);
                }
                self.controlDiv = $.extend(true, {}, options.controlDiv);
            }

            self.options = $.extend(true, {}, self.defaultOptions, options);
            self._destroy();
            self._render();
        },

        _toggleNodes: function(node) {
            if (!node.Children && !node._Children) {
                return;
            }
            if (node.Children) {
                node.folded = true;
                node._Children = node.Children;
                delete node.Children;
            } else {
                node.folded = false;
                node.Children = node._Children;
                delete node._Children;
            }
        },
        _findNode: function(target) {
            var nodeId = target.closest('li.tree-node').attr('data-nodeid');
            var node = this.nodes[nodeId];
            if (!node) {
                window.console.log('Error: node does not exist');
            }
            return node;
        },
        _findNodeById: function(nodeId, node) {
            var self = this;

            if (nodeId == node.Id) {
                return node;
            }
            if (node.Children == null) {
                return null;
            }
            if (node.Children && node.Children.length > 0) {
                for (var i = node.Children.length - 1; i >= 0; i--) {
                    var result = self._findNodeById(nodeId, node.Children[i]);
                    if (result != null) {
                        return result;
                    }
                }
                ;
            }
        },
        _render: function() {
            var self = this;
            if (!self.initialized) {
                self.$element.addClass(pluginName);
                self.$wrapper = $(pluginGlobal._template.list);
            }
            self.$element.empty();

            self._build();
            self._bindDefaultEvent();
            self.initialized = true;
        },
    });

    $.fn[pluginName] = function(options, args) {
        var result = [];
        this.each(function() {
            var self = $.data(this, 'plugin_' + pluginName);
            if (typeof options === 'string') {
                if (!self) {
                    pluginGlobal.logError('Not initialized, can not call method : ' + options);
                } else if (!$.isFunction(self[options]) || options.charAt(0) === '_') {
                    pluginGlobal.logError('No such method : ' + options);
                } else {
                    if (typeof args === 'string') {
                        args = [args];
                    }
                    self[options].apply(self, args);
                }
            } else {
                if (!self) {
                    result[result.length] = $.data(this, 'plugin_' + pluginName, new Tree(this, $.extend(true, {}, options)));
                } else {
                    self._init(options);
                }
            }
        });
        return result;
    };
})(window.jQuery);