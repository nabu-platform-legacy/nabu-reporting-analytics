application.configuration.modules.push(function($services) {
	var reports = window.localStorage.nabuAnalyticReports;
	var actions = [];
	
	var readOnly = ${when(application.configuration("nabu.reporting.analytics.management.configuration")/readOnly == null, false, application.configuration("nabu.reporting.analytics.management.configuration")/readOnly)};
	
	var promise = $services.q.defer();
	
	// register the services
	$services.$register({ 
		analytics: {
			data: nabu.analytics.Data,
			reports: {
				database: nabu.analytics.DatabaseReports,
				local: nabu.analytics.LocalReports
			}
		}
	}).then(function() {
		// force the lazy load of the database service and once that is done, register the necessary routes
		$services.analytics.reports.database.$lazy().then(function() {
			nabu.utils.arrays.merge(actions, $services.analytics.reports.database.actions);
			if (!readOnly) {
				$services.router.register({
					alias: "analyticsReports",
					enter: function(parameters) {
						return new application.views.AnalyticsReports({ data: parameters });
					},
					url: "/analytics/reports"
				});
				$services.router.register({
					alias: "analyticsLocalReport",
					services: ["analytics.reports.local"],
					enter: function(parameters) {
						var report = $services.analytics.reports.local.get(parameters.name);
						if (!report) {
							throw "Could not find local report: " + parameters.name;
						}
						return new application.views.AnalyticsReport({ data: { report: JSON.parse(JSON.stringify(report)), values: parameters.values, type: "local" } });
					},
					url: "/analytics/report/local/{name}"
				});
				actions.push({
					title: "Manage Reports",
					handler: function() {
						$services.router.route("analyticsReports");
					}
				});
			}
		
			$services.manager.menu({
				title: "Analytics",
				actions: actions
			});
			
			$services.router.register({
				alias: "analyticsDatabaseReport",
				services: ["analytics.reports.database"],
				enter: function(parameters) {
					var report = $services.analytics.reports.database.get(parameters.name);
					if (!report) {
						throw "Could not find database report: " + parameters.name;
					}
					return new application.views.AnalyticsReport({ data: { report: JSON.parse(report.report), editable: false, values: parameters.values, type: "database" } });
				},
				url: "/analytics/report/database/{name}"
			});
			
			promise.resolve();
		}, promise);
	});
	return promise;	
});
