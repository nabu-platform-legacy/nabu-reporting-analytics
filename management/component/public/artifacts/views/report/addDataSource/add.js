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
			named: true,
			properties: [],
			limited: true,
			connectionId: null,
			groupBy: null
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
			console.log("TYPE IS", this.type);
			for (var i = 0; i < this.sources.length; i++) {
				if (this.sources[i].types.indexOf(this.type) >= 0) {
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
				limit: this.limited ? this.limit : null,
				offset: 0,
				parameters: this.properties,
				connectionId: this.connectionId,
				resultSet: null,
				groupBy: this.groupBy
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			console.log("validating", messages);
			this.valid = messages.length == 0;
		}
	},
	watch: {
		source: function(newValue) {
			this.properties.splice(0, this.properties.length);
			if (newValue.input) {
				for (var i = 0; i < newValue.input.length; i++) {
					var object = nabu.utils.objects.clone(newValue.input[i]);
					object.key = object.name;
					object.value = null;
					delete object.name;
					this.properties.push(object);
				}
			}
		}
	}
});