application.initialize.modules.push(function() {
	application.services.vue.menu.push({
		title: "nabu",
		children: [{
			title: "Do Something!",
			handle: function() {
				application.services.router.route("routeSomewhere");
			}
		}]
	});
});