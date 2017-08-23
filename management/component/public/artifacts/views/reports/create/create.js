application.views.AnalyticsLocalReportCreate = Vue.extend({
	template: "#analyticsLocalReportCreate",
	data: function() {
		return {
			name: null,
			reports: null,
			valid: false
		};
	},
	methods: {
		create: function() {
			this.$resolve({
				name: this.name,
				created: new Date().toISOString(),
				entries: []
			});
		},
		validateReport: function(name) {
			var messages = [];
			for (var i = 0; i < this.reports.length; i++) {
				if (this.reports[i].name == name) {
					messages.push({
						type: "error",
						title: "A report with the name '" + name + "' already exists"
					});
					break;
				}
			}
			return messages;
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	}
});