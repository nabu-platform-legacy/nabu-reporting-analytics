Vue.component("n-analytics-pie", {
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
			if (this.entry.data.length && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results && this.entry.data[0].resultSet.results.length) {
				var result = this.entry.data[0].resultSet.results[0];
				nabu.utils.arrays.merge(labels, Object.keys(result));
			}
			return labels;
		},
		series: function() {
			var series = [];
			if (this.entry.data.length && this.entry.data[0].resultSet && this.entry.data[0].resultSet.results && this.entry.data[0].resultSet.results.length) {
				var result = this.entry.data[0].resultSet.results[0];
				var keys = Object.keys(result);
				for (var i = 0; i < keys.length; i++) {
					series.push(result[keys[i]]);
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
				labelOffset: donut ? 45 : 75,
    			labelDirection: 'explode',
    			startAngle: halfDonut ? 270 : 0,
    			total: halfDonut ? 16 : 0,
    			donutWidth: 60,
				plugins: plugins
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