application.configuration.modules.push(function($services) {
	var reports = window.localStorage.nabuAnalyticReports;
	var actions = [];
	actions.push({
		title: "Local Reports",
		handler: function() {
			$services.router.route("analyticsLocalReports");
		}
	});

	$services.manager.menu({
		title: "Analytics",
		actions: actions
	});
	
	$services.router.register({
		alias: "analyticsLocalReports",
		enter: function(parameters) {
			return new application.views.AnalyticsLocalReports({ data: parameters });
		},
		url: "/analytics/reports/local"
	});
	$services.router.register({
		alias: "analyticsReport",
		enter: function(parameters) {
			return new application.views.AnalyticsReport({ data: parameters });
		},
		url: "/analytics/report/{name}"
	});
	
	return $services.$register(nabu.reporting.Analytics);
});