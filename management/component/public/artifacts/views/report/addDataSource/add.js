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
			named: true
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
				limit: this.limit,
				offset: 0,
				parameters: [],
				resultSet: null
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	}
});