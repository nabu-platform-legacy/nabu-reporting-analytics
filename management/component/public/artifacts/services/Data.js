nabu.services.VueService(Vue.extend({
	data: function() {
		return {
			sources: []
		}
	},
	activate: function(done) {
		var self = this;
		this.$services.swagger.execute("nabu.reporting.analytics.management.rest.sources").then(function(sourceList) {
			if (sourceList.sources) {
				nabu.utils.arrays.merge(self.sources, sourceList.sources);
			}
			done();
		});
	},
	methods: {
		download: function(dataSets, type) {
			if (!type) {
				type = "json";
			}
			var self = this;
			return self.$services.swagger.execute("nabu.reporting.analytics.management.rest.store", { body: { dataSets: dataSets, type: type }}).then(function(response) {
				if (response.uri) {
					var parameters = self.$services.swagger.parameters("nabu.reporting.analytics.management.rest.retrieve", { uri: response.uri });
					window.location = parameters.url;
				}
			});
		}
	}
}), { name: "nabu.analytics.Data", lazy: true });

