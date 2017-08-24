application.views.AnalyticsReportAddDataSource = Vue.extend({
	template: "#analyticsReportAddDataSource",
	data: function() {
		return {
			name: null,
			valid: false, 
			sources: null,
			source: null,
			orderBy: [],
			limit: 10,
			named: true,
			properties: [],
			limited: true
		};
	},
	activate: function(done) {
		var self = this;
		this.$services.analytics.sources().then(function(sources) {
			Vue.set(self, "sources", sources);
			done();
		});
	},
	computed: {
		filteredSources: function() {
			var filtered = [];
			for (var i = 0; i < this.sources.length; i++) {
				if (this.sources[i].type == this.type) {
					filtered.push(this.sources[i]);
				}
			}
			return filtered;
		}	
	},
	methods: {
		create: function() {
			this.$resolve({
				name: this.name,
				created: new Date().toISOString(),
				id: this.source.id,
				orderBy: this.orderBy,
				limit: this.limited ? this.limit : null,
				offset: 0,
				parameters: this.properties,
				resultSet: null
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			console.log("validating", messages);
			this.valid = messages.length == 0;
		}
	},
	watch: {
		source: function(newValue) {
			this.properties.splice(0, this.properties.length);
			if (newValue.input) {
				nabu.utils.arrays.merge(this.properties, newValue.input);
				for (var i = 0; i < this.properties.length; i++) {
					Vue.set(this.properties[i], "key", this.properties[i].name);
					Vue.set(this.properties[i], "value", null);
					delete this.properties[i].name;
				}
			}
		}
	}
});