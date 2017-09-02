application.views.AnalyticsReports = Vue.extend({
	template: "#analyticsReports",
	services: [
		"analytics.reports.local", 
		"analytics.reports.database"
	],
	data: function() {
		return {
			reports: []
		}
	},
	methods: {
		deleteDatabase: function(report, $event) {
			var self = this;
			$event.stopPropagation();
			this.$confirm({ 
				message: 'Are you sure you want to delete this report?', 
				type: 'question', 
				ok: 'Delete'
			}).then(function() {
				self.$services.analytics.reports.database.delete(report);
			});
		},
		deleteLocal: function(report, $event) {
			var self = this;
			$event.stopPropagation();
			this.$confirm({ 
				message: 'Are you sure you want to delete this report?', 
				type: 'question', 
				ok: 'Delete' 
			}).then(function() {
				self.$services.analytics.reports.local.delete(report)
			});
		}
	}
});