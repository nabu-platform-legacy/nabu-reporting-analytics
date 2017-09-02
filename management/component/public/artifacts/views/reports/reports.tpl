<template id="analyticsReports">
	<section class="analyticsReports">
		<div class="page-menu">
			<h1 class="title">Reports</h1>
			<button class="info" @click="$services.analytics.reports.local.create()"><span class="n-icon n-icon-plus"></span>Report</button>
		</div>
		<h2>Local</h2>
		<div class="row" :class="{ 'table': $services.manager.tableView() }">
			<div class="card table-header">
				<span>Name</span>
				<span>Description</span>
				<span>Created</span>
			</div>
			<div class="card fill" v-for="report in $services.analytics.reports.local.reports">
				<h2 @click="$services.router.route('analyticsLocalReport', { name: report.name })" v-css.show-details>{{ report.name }}
					<button @click="deleteLocal(report, $event)" class="delete"></button></h2>
				<div class="property">
					<span class="key">Description</span>
					<span class="value">{{ report.description }}</span>
				</div>
				<div class="property last">
					<span class="key">Created</span>
					<span class="value">{{ formatDateTime(new Date(report.created)) }}<button class="info" @click="$services.analytics.reports.database.save(report)"><span class="n-icon n-icon-chevron-right" title="Push to server"></span></button></span>
				</div>
			</div>
		</div>
		<h2>Server</h2>
		<div class="row" :class="{ 'table': $services.manager.tableView() }">
			<div class="card table-header">
				<span>Name</span>
				<span>Description</span>
				<span>Created</span>
				<span>Modified</span>
			</div>
			<div class="card fill" v-for="report in $services.analytics.reports.database.reports">
				<h2 @click="$services.router.route('analyticsDatabaseReport', { name: report.name })" v-css.show-details>{{ report.name }}
					<button @click="deleteDatabase(report, $event)" class="delete"></button></h2>
				<div class="property">
					<span class="key">Description</span>
					<span class="value">{{ report.description }}</span>
				</div>
				<div class="property">
					<span class="key">Created</span>
					<span class="value">{{ formatDateTime(new Date(report.created)) }}</span>
				</div>
				<div class="property last">
					<span class="key">Modified</span>
					<span class="value">{{ formatDateTime(new Date(report.modified)) }}<button class="info" @click="$services.analytics.reports.local.save(report)"><span class="n-icon n-icon-chevron-left" title="Pull from server"></span></button></span>
				</div>
			</div>
		</div>
	</section>
</template>