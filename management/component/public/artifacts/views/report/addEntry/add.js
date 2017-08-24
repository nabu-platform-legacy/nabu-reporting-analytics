application.views.AnalyticsReportAddEntry = Vue.extend({
	template: "#analyticsReportAddEntry",
	data: function() {
		return {
			type: null,
			subType: null,
			name: null,
			description: null,
			valid: false
		};
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
				description: this.description,
				created: new Date().toISOString(),
				type: this.type,
				subType: this.subType,
				data: []
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	}
});