application.views.AnalyticsReportAddProperty = Vue.extend({
	template: "#analyticsReportAddProperty",
	data: function() {
		return {
			name: null,
			typeName: 'string',
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
		add: function() {
			this.$resolve({
				key: this.name,
				value: null,
				typeName: this.typeName
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	}
});