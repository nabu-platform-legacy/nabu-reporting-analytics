Vue.component("n-analytics-pie", {
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
			if (this.entry.data.length == 1 && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results && this.entry.data[0].resultSet.results.length) {
				var results = this.entry.data[0].resultSet.results;
				if (results.length > 1) {
					var key = null;
					for (var i = 0; i < results.length; i++) {
						if (!key) {
							key = Object.keys(results[i])[0];
						}
						labels.push(results[i][key]);
					}
				}
				else {
					var result = results[0];
					nabu.utils.arrays.merge(labels, Object.keys(result));
				}
			}
			return labels;
		},
		series: function() {
			var series = [];
			if (this.entry.data.length && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results && this.entry.data[0].resultSet.results.length) {
				var results = this.entry.data[0].resultSet.results;
				if (results.length > 1) {
					var key = null;
					for (var i = 0; i < results.length; i++) {
						if (!key) {
							key = Object.keys(results[i])[1];
						}
						series.push(results[i][key]);
					}
				}
				else {
					var result = results[0];
					var keys = Object.keys(result);
					for (var i = 0; i < keys.length; i++) {
						series.push(result[keys[i]]);
					}
				}
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
		}
	},
	methods: {
		draw: function() {
			if (this.$el) {
				var self = this;
				
				nabu.utils.elements.clear(this.$el);
				
				if (this.entry.subType == 'FACT' || this.entry.type == "FACT") {
					this.$el.setAttribute("class", "fact fact-" + this.labels.length);
					
					var addDiv = function(i) {
						var div = document.createElement("div");
						var label = document.createElement("label");
						label.innerHTML = self.labels[i];
						
						var span = document.createElement("span");
						span.innerHTML = self.series[i];
						
						div.appendChild(span);
						div.appendChild(label);
						
						self.$el.appendChild(div);
						
						var clazz = "";
						
						if (self.entry.colorize) {
							var value = parseFloat(self.series[i]);
							if (!isNaN(value)) {
								clazz += " " + (value >= 0 ? "fact-good" : "fact-bad");
							}
						}
						
						if (self.entry.drillDown) {
							clazz += " clickable";
							div.addEventListener("click", function() {
								var value = self.entry.drillDownValue ? self.series[i] : self.labels[i];
								self.$services.router.route(self.route, { name: self.entry.drillDown, values: [value] });
							});
						}
						span.setAttribute("class", clazz);
					}

					var hidden = {};
					if (this.entry.data[0].hide) {
						for (var i = 0; i < this.entry.data[0].hide.length; i++) {
							hidden[this.entry.data[0].hide[i].key] = this.entry.data[0].hide[i].hide;		
						}
					}
					for (var i = 0; i < this.labels.length; i++) {
						if (!hidden[self.labels[i]]) {
							addDiv(i);
						}
					}
				}
				else {
					var newTarget = document.createElement("div");
					newTarget.setAttribute("class", "ct-chart");
					
					var plugins = [];
					
					plugins.push(Chartist.plugins.tooltip());
					
					if (this.entry.showLegend) {
						plugins.push(Chartist.plugins.legend({
							legendNames: this.labels,
							position: "bottom"
						}));
					}
					
					var constructor = Chartist.Pie;
					
					var halfDonut = this.entry.subType == "DONUT_HALF";
					var donut = this.entry.subType == "DONUT" || halfDonut;
					
				 	var chart = new constructor(newTarget, {
						labels: self.labels,
						series: self.series
					}, {
						chartPadding: 20,
						offset: 10,
						donut: donut,
						fullWidth: true,
						labelOffset: donut ? 45 : 65,
		    			labelDirection: 'explode',
		    			startAngle: halfDonut ? 270 : 0,
		    			total: halfDonut ? 16 : 0,
		    			donutWidth: 60,
		    			showLabel: !this.entry.showLegend,
						plugins: plugins
					});
					
					chart.on('draw', function(data) {
						if (data.type === "slice") {
							if (self.entry.drillDown) {
								data.element._node.addEventListener("click", function() {
									// data.value contains the point
									// labels are in a different data entry with data.type == label
									// both have an index
									var value = self.entry.drillDownOnValue ? self.series[data.index] : self.labels[data.index];
									self.$services.router.route(self.route, { name: self.entry.drillDown, values: [value] })
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