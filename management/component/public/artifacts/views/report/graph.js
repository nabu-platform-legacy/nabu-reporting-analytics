Vue.component("n-analytics-graph", {
	props: ["entry"],
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
		series: function() {
			var series = [];
			for (var i = 0; i < this.entry.data.length; i++) {
				var values = [];
				if (this.entry.data[i].resultSet && this.entry.data[i].resultSet.results) {
					for (var j = 0; j < this.entry.data[i].resultSet.results.length; j++) {
						var result = this.entry.data[i].resultSet.results[j];
						var keys = Object.keys(result);
						values.push({
							// show the y-value in the meta
							meta: this.entry.showAxisTitle ? '' : keys[keys.length > 1 ? 1 : 0],
							// the value is the y-axis
							value: result[keys[keys.length > 1 ? 1 : 0]]
						});
					}
				}
				series.push(values);
			}
			return series;
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
					legends.push(this.entry.data[i].name);
				}
			}
			return legends;
		}
	},
	methods: {
		draw: function() {
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
				showArea: true,
				axisX: {
					labelInterpolationFnc: function (value, index) {
						var interval = Math.floor(self.labels.length / 10.0);
						var result = self.labels.length < 10 || index % interval == 0 ? value : null;
						return result;
					}
				},
				axisY: {
					scaleMinSpace: 15	
				},
				//showPoint: false,
				fullWidth: true,
				lineSmooth: lineSmooth,
				plugins: plugins
			});
			
			// draw custom points for no reason
			chart.on('draw', function(data) {
				// If the draw event was triggered from drawing a point on the line chart
				if (data.type === 'point') {
					// We are creating a new path SVG element that draws a triangle around the point coordinates
					var letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
				
					var circle = new Chartist.Svg('circle', {
						cx: [data.x],
						cy: [data.y],
						r: [3],
						'ct:value': data.value.y,
						'ct:meta': data.meta
					}, 'ct-point ct-point-' + letters[data.seriesIndex]);
				
					// With data.element we get the Chartist SVG wrapper and we can replace the original point drawn by Chartist with our newly created triangle
					data.element.replace(circle);
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
});