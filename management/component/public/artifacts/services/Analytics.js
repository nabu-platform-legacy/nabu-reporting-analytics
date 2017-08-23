if (!nabu) { var nabu = {} };
if (!nabu.reporting) { nabu.reporting = {} };

nabu.reporting.Analytics = function Analytics($services) {
	var self = this;
	
	this.state = {
		sources: null
	};
	
	Vue.observe(this.state, true);
	
	this.sources = function() {
		var promise = $services.q.defer();
		if (this.state.sources) {
			promise.resolve(this.state.sources);
		}
		else {
			$services.swagger.execute("nabu.reporting.analytics.management.rest.sources").then(function(sourceList) {
				Vue.set(self.state, "sources", sourceList.sources ? sourceList.sources : []);
				promise.resolve(self.state.sources);
			});
		}
		return promise;
	}
	
}