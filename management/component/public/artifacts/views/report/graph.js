Vue.component("n-analytics-graph", {
	props: ["entry", "route"],
	template: "<div></div>",
	data: function() {
		return {
			target: null
		}
	},
	created: function() {
		Vue.set(this.entry, "drawn", false);	
	},
	ready: function() {
		this.draw();
	},
	computed: {
		labels: function() {
			var labels = [];
			if (this.entry.data.length && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results) {
				for (var j = 0; j < this.entry.data[0].resultSet.results.length; j++) {
					var result = this.entry.data[0].resultSet.results[j];
					var keys = Object.keys(result);
					labels.push(keys.length == 1 ? j : result[keys[0]]);
				}
			}
			return labels;
		},
		groupedSeries: function() {
			var grouped = {};
			for (var i = 0; i < this.entry.data.length; i++) {
				if (this.entry.data[i].resultSet && this.entry.data[i].resultSet.results) {
					if (this.entry.data[i].groupBy) {
						var currentValue = null;
						var xValues = [];
						for (var j = 0; j < this.entry.data[i].resultSet.results.length; j++) {
							var result = this.entry.data[i].resultSet.results[j];
							var keys = Object.keys(result);
							var value = result[this.entry.data[i].groupBy];
							var xValue = result[keys[0]];
							// ignore the undefined values
							if (typeof(value) != "undefined") {
								var values = grouped[value];
								if (!values) {
									values = [];
									// if we make a new array, backfill for missing x values
									for (var l = 0; l < xValues.length; l++) {
										values.push({
											meta: (this.entry.showAxisTitle ? '' : keys[keys.length > 1 ? 1 : 0] + " - ") + value + " (" + this.format(xValues[l]) + ")",
											value: 0,
											xValue: xValues[l]
										});
									}
									grouped[value] = values;
								}
								values.push({
									// show the y-value in the meta
									meta: (this.entry.showAxisTitle ? '' : keys[keys.length > 1 ? 1 : 0] + " - ") + value + " (" + this.format(xValue) + ")",
									// the value is the y-axis
									value: result[keys[keys.length > 1 ? 1 : 0]],
									xValue: xValue
								});
							}
							// we are switching to a new value, make sure every grouped series has "some" value
							if (xValue != currentValue) {
								var groupKeys = Object.keys(grouped);
								for (var k = 0; k < groupKeys.length; k++) {
									var values = grouped[groupKeys[k]];
									if (!values) {
										values = [];
										grouped[groupKeys[k]] = values;
									}
									if (!values.length || values[values.length - 1].xValue !== xValue) {
										values.push({
											meta: (this.entry.showAxisTitle ? '' : keys[keys.length > 1 ? 1 : 0] + " - ") + groupKeys[k] + " (" + this.format(xValue) + ")",
											value: 0,
											xValue: xValue
										});
									}
								}
								currentValue = xValue;
							}
							xValues.push(xValue);
						}
					}
				}
			}
			return grouped;
		},
		series: function() {
			var series = [];
			for (var i = 0; i < this.entry.data.length; i++) {
				if (this.entry.data[i].resultSet && this.entry.data[i].resultSet.results) {
					if (!this.entry.data[i].groupBy) {
						var values = [];
						for (var j = 0; j < this.entry.data[i].resultSet.results.length; j++) {
							var result = this.entry.data[i].resultSet.results[j];
							var keys = Object.keys(result);
							values.push({
								// show the x-value in the meta
								meta: keys.length > 1 ? this.format(result[keys[0]]) : '',
								// the value is the y-axis
								value: result[keys[keys.length > 1 ? 1 : 0]],
								endValue: keys.length > 2 ? result[keys[2]] : 0
							});
						}
						series.push(values);
					}
				}
			}
			var grouped = this.groupedSeries;
			var keys = Object.keys(grouped);
			for (var i = 0; i < keys.length; i++) {
				series.push(grouped[keys[i]]);
			}
			return series;
		},
		min: function() {
			if (this.series.length) {
				var min = null;
				for (var i = 0; i < this.series[0].length; i++) {
					if (min == null || this.series[0][i].value < min) {
						min = this.series[0][i].value;
					}
				}
				return min;
			}
			return null;
		},
		max: function() {
			if (this.series.length) {
				var max = null;
				for (var i = 0; i < this.series[0].length; i++) {
					if (max == null || this.series[0][i].value > max) {
						max = this.series[0][i].value;
					}
				}
				return max;
			}
			return null;
		},
		axes: function() {
			var axes = [];
			if (this.entry.data.length && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results) {
				var result = this.entry.data[0].resultSet.results[0];
				nabu.utils.arrays.merge(axes, Object.keys(result));
			}
			return axes;
		},
		legends: function() {
			var legends = [];
			if (this.entry.data) {
				for (var i = 0; i < this.entry.data.length; i++) {
					if (!this.entry.data[i].groupBy) {
						legends.push(this.entry.data[i].name);
					}
				}
			}
			var grouped = this.groupedSeries;
			nabu.utils.arrays.merge(legends, Object.keys(grouped));
			return legends;
		}
	},
	methods: {
		format: function(result) {
			var self = this;
			if (result != null && self.entry.formatter) {
				var date = null;
				if (result instanceof Date) {
					date = result;
				}
				else {
					date = new Date(result);
				}
				if (self.entry.formatter == "date") {
					result = date.toLocaleDateString();
				}
				else if (self.entry.formatter == "time") {
					result = date.toLocaleTimeString();
				}
				else if (self.entry.formatter == "dateTime") {
					result = date.toLocaleString();
				}
			}
			return result;
		},
		draw: function() {
			if (this.$el) {
				var self = this;
				var newTarget = document.createElement("div");
				newTarget.setAttribute("class", "ct-chart");
				
				var plugins = [];
				
				plugins.push(Chartist.plugins.tooltip());
				
				if (this.entry.showAxisTitle) {
					plugins.push(Chartist.plugins.ctAxisTitle({
						axisX: {
							axisTitle: this.axes[0],
							axisClass: 'ct-axis-title',
							offset: {
								x: 10,
								y: 30
							},
							textAnchor: 'middle'
						},
						axisY: {
							axisTitle: this.axes.length > 1 ? this.axes[1] : '',
							axisClass: 'ct-axis-title',
							offset: {
								x: 10,
								y: 30
							},
							textAnchor: 'middle',
							flipTitle: false
						}
					}));
				}
				
				if (this.entry.showLegend) {
					plugins.push(Chartist.plugins.legend({
						legendNames: this.legends,
						position: "bottom"
					}));
				}
				
				var constructor = Chartist.Line;
				
				if (this.entry.type == "GAUGE") {
					constructor = Chartist.Pie;
				}
				else if (this.entry.subType == "BAR" || this.entry.subType == "BAR_STACKED") {
					constructor = Chartist.Bar;
				}
				
				var lineSmooth = Chartist.Interpolation.simple({
					divisor: 2
				});
				
				lineSmooth = null;
				
			 	var chart = new constructor(newTarget, {
					labels: self.labels,
					series: self.series
				}, {
					donut: this.entry.subType == "DONUT",
					seriesBarDistance: 10,
					stackBars: this.entry.subType == "BAR_STACKED",
					showArea: self.entry.type != "WATERFALL",
					axisX: {
						offset: self.entry.angleLabels ? 50 : 30,
						labelInterpolationFnc: function (value, index) {
							var interval = Math.floor(self.labels.length / 15.0);
							var result = self.labels.length < 10 || index % interval == 0 ? value : null;
							return self.format(result);
						}
					},
					axisY: {
						offset: self.entry.angleLabels ? 110 : 40,
						scaleMinSpace: 15	
					},
					//showPoint: false,
					fullWidth: true,
					height: self.entry.type == "WATERFALL" ? "450px" : null,
					lineSmooth: lineSmooth,
					plugins: plugins
				});
				
				var grid = null;
				var mainLine = null;
				
				// draw custom points for no reason
				chart.on('draw', function(data) {
					if (data.type === "line" && self.entry.type == "WATERFALL") {
						if (data.element._node.classList.contains("ct-line")) {
							if (grid == null) {
								grid = self.$el.querySelector(".ct-chart .ct-grids");
							}
							var bounding = grid ? grid.getBBox() : null;
							if (bounding) {
								var factor = bounding.height / (self.max - self.min);
								var target = new Chartist.Svg.Path(false);
								var line = new Chartist.Svg.Path(true);
								line.parse(data.element._node.getAttribute("d"));
								line.transform(function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
									var last = self.series[0].length == pathElementIndex - 1;
									if (paramIndex == 0) {
										if (pathElement.command == "M") {
											target.move(pathElement.x, pathElement.y);
										}
										else if (pathElement.command == "L") {
											// copy initial line
											target.line(pathElement.x, pathElement.y);
											// draw additional line to the end value
											target.line(pathElement.x, bounding.height - ((self.series[0][pathElementIndex].endValue - self.min) * factor));
										}
									}
								});
								var path = Chartist.Svg('path', {
									d: target.stringify()
								}, 'ct-waterfall-line ' + data.element._node.getAttribute("class"));
								
								data.element.replace(path);
							}
						}
					}
					
					// We are creating a new path SVG element that draws a triangle around the point coordinates
					var letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
					// If the draw event was triggered from drawing a point on the line chart
					if (data.type === 'point') {
						if (self.entry.type == "WATERFALL") {
							var value = self.series[data.seriesIndex][data.index];

							if (grid == null) {
								grid = self.$el.querySelector(".ct-chart .ct-grids");
							}
							
							var bounding = grid ? grid.getBBox() : null;

							if (bounding) {
								var factor = bounding.height / (self.max - self.min);

								var line = new Chartist.Svg.Path(false);
								line.move(data.x, data.y).line(data.x, bounding.height - ((value.endValue - self.min) * factor));
							
								var path = Chartist.Svg('path', {
									d: line.stringify(),
									'ct:value': value.value + " - " + value.endValue,
									'ct:meta': data.meta
								}, 'ct-point ct-point-' + letters[data.seriesIndex] + ' ct-waterfall-increment ' + (value.endValue > value.value ? "ct-waterfall-positive" : "ct-waterfall-negative"));

								//path.move(self.series[data.seriesIndex][data.index].endValue * factor, data.y);
								data.element.replace(path);
							}
						}
						else {
							var circle = new Chartist.Svg('circle', {
								cx: [data.x],
								cy: [data.y],
								r: [3],
								'ct:value': data.value.y,
								'ct:meta': data.meta
							}, 'ct-point ct-point-' + letters[data.seriesIndex] + (!self.entry.showDots ? ' ct-point-hidden' : ''));
						
							// With data.element we get the Chartist SVG wrapper and we can replace the original point drawn by Chartist with our newly created triangle
							data.element.replace(circle);
						}
					}
					else if (self.entry.angleLabels && data.type === 'label') {
						// adjust label position for rotation
						var dX = data.width / 2 + (100 - data.width)
						data.element.attr({ x: data.element.attr('x') - dX });
						data.element.addClass("ct-label-rotated");
					}
					
					if (data.type === "point" || data.type === "bar") {
						if (self.entry.drillDown) {
							data.element._node.addEventListener("click", function() {
								self.$services.router.route(self.route, { name: self.entry.drillDown, values: [self.labels[data.index]] })
							});
							data.element._node.classList.add("ct-clickable");
						}
					}
				});
				
				if (this.target) {
					this.$el.removeChild(this.target);
				}
				this.$el.appendChild(newTarget);
				this.target = newTarget;
				this.entry.drawn = true;
			}
		}
	},
	watch: {
		entry: {
			deep: true,
			handler: function() {
				this.draw();
			}
		}
	}
});