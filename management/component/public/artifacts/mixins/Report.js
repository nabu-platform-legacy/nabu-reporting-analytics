if (!nabu) { var nabu = {} };
if (!nabu.mixins) { nabu.mixins = {} };

nabu.mixins.analytics = {
	Report: {
		methods: {
			get: function(name) {
				for (var i = 0; i < this.reports.length; i++) {
					if (this.reports[i].name == name || this.reports[i].name == decodeURIComponent(name)) {
						return this.reports[i];
					}
				}
				return null;
			}
		}
	}
}