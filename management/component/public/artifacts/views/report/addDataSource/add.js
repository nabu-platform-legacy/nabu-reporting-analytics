application.views.AnalyticsReportAddDataSource = Vue.extend({
	template: "#analyticsReportAddDataSource",
	services: ["analytics.data"],
	data: function() {
		return {
			name: null,
			valid: false, 
			source: null,
			orderBy: [],
			limit: 10,
			named: true,
			properties: [],
			limited: true,
			connectionId: null,
			groupBy: null,
			// properties for this source that are bound to report-level properties
			boundProperties: [],
			// properties available from the report
			reportProperties: [],
			// the properties to hide
			hide: []
		};
	},
	created: function() {
		var self = this;
		if (this.reportProperties) {
			for (var i = 0; i < this.reportProperties.length; i++) {
				var property = nabu.utils.objects.clone(this.reportProperties[i]);
				property.value = null;
				this.boundProperties.push(property);
			}
		}
	},
	computed: {
		filteredSources: function() {
			var filtered = [];
			for (var i = 0; i < this.$services.analytics.data.sources.length; i++) {
				if (this.$services.analytics.data.sources[i].types.indexOf(this.type) >= 0) {
					filtered.push(this.$services.analytics.data.sources[i]);
				}
			}
			return filtered;
		}	
	},
	methods: {
		create: function() {
			// copy the current value from the report so it can run properly
			for (var i = 0; i < this.reportProperties.length; i++) {
				for (var j = 0; j < this.boundProperties.length; j++) {
					if (this.reportProperties[i].key == this.boundProperties[j].key) {
						for (var k = 0; k < this.properties.length; k++) {
							if (this.properties[k].key == this.boundProperties[j].value) {
								this.properties[k].value = this.reportProperties[i].value;
							}
						}
					}
				}
			}
			this.$resolve({
				name: this.name,
				created: new Date().toISOString(),
				id: this.source.id,
				orderBy: this.orderBy,
				limit: this.limited ? this.limit : null,
				offset: 0,
				parameters: this.properties,
				boundParameters: this.boundProperties,
				connectionId: this.connectionId,
				resultSet: null,
				groupBy: this.groupBy,
				hide: this.hide
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		},
		isBound: function(property) {
			for (var i = 0; i < this.boundProperties.length; i++) {
				if (this.boundProperties[i].value == property.key) {
					return true;
				}
			}
			return false;
		}
	},
	watch: {
		source: function(newValue) {
			this.properties.splice(0, this.properties.length);
			this.hide.splice(0, this.hide.length);
			if (newValue.input) {
				for (var i = 0; i < newValue.input.length; i++) {
					var object = nabu.utils.objects.clone(newValue.input[i]);
					object.key = object.name;
					object.value = null;
					delete object.name;
					this.properties.push(object);
				}
			}
			if (newValue.output && this.type == "FACT") {
				for (var i = 0; i < newValue.output.length; i++) {
					this.hide.push({
						key: newValue.output[i].name,
						hide: false
					});
				}
			}
		}
	}
});