<template id="analyticsLocalReports">
	<section class="analyticsLocalReports">
		<div class="page-menu">
			<h1 class="title">Reports</h1>
			<button class="info" @click="addReport"><span class="n-icon n-icon-plus"></span>Report</button>
		</div>
		<h2>Local</h2>
		<div class="row" :class="{ 'table': $services.manager.tableView() }">
			<div class="card table-header">
				<span>Name</span>
				<span>Description</span>
				<span>Created</span>
			</div>
			<div class="card fill" v-for="report in reports">
				<h2 @click="$services.router.route('analyticsReport', { name: report.name })" v-css.show-details>{{ report.name }}
					<button @click="$confirm({ message: 'Are you sure you want to delete this report?', type: 'question', ok: 'Delete' }).then(deleteReport.bind(this, report));$event.stopPropagation()" class="delete"></button></h2>
				<div class="property">
					<span class="key">Description</span>
					<span class="value">{{ report.description }}</span>
				</div>
				<div class="property last">
					<span class="key">Created</span>
					<span class="value">{{ formatDateTime(new Date(report.created)) }}<button class="info" @click="merge(report)"><span class="n-icon n-icon-chevron-right" title="Push to server"></span></button></span>
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
			<div class="card fill" v-for="report in databaseReports">
				<h2 @click="$services.router.route('analyticsDatabaseReport', { report: JSON.parse(report.report), editable: false })" v-css.show-details>{{ report.name }}
					<button @click="$confirm({ message: 'Are you sure you want to delete this report?', type: 'question', ok: 'Delete' }).then(deleteDatabaseReport.bind(this, report));$event.stopPropagation()" class="delete"></button></h2>
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
					<span class="value">{{ formatDateTime(new Date(report.modified)) }}<button class="info" @click="storeLocal(report)"><span class="n-icon n-icon-chevron-left" title="Pull from server"></span></button></span>
				</div>
			</div>
		</div>
	</section>
</template>