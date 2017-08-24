<template id="analyticsReport">
	<div class="analyticsReport" :class="{'editing': editing}">
		<div class="page-menu">
			<h1 class="title">{{ report.name }}</h1>
			<button v-if="!editing" class="info" @click="editing = true"><span class="n-icon n-icon-pencil"></span>Edit</button>
			<button v-if="!editing" ref="copier"><span class="n-icon n-icon-clipboard"></span>Copy to Clipboard</button>
			<button v-if="editing" class="info" @click="addRow"><span class="n-icon n-icon-plus"></span>Add Row</button>
			<button v-if="editing" class="success" @click="save"><span class="n-icon n-icon-save"></span>Save</button>
			<button v-if="editing" @click="cancel"><span class="n-icon n-icon-times"></span>Cancel</button>
		</div>
		<div v-for="row in report.rows" class="row" :class="'row-' + row.entries.length">
			<div v-for="entry in row.entries" class="card" :class="'type-' + entry.type">
				<h2 v-auto-close="function() { toggleFilter(entry, false) }">
					<div class="download" v-if="entry.data && entry.data.length && entry.type != 'GAUGE'">
						<span class="n-icon n-icon-table" title="Download as CSV" @click="download(entry, 'csv')"></span>
						<span class="n-icon n-icon-code" title="Download as XML" @click="download(entry, 'xml')"></span>
						<span class="n-icon n-icon-download" title="Download as JSON" @click="download(entry, 'json')"></span>
					</div>
					<span>{{ entry.name }}</span> <n-info v-if="entry.description">{{ entry.description }}</n-info>
					<span class="n-icon n-icon-search" @click="toggleFilter(entry)" v-if="entry.data && entry.data.length && entry.data[0].parameters && entry.data[0].parameters.length"></span>
					<div class="filter" v-if="entry.showFilter">
						<n-form-text v-timeout:input="function() { loadPage(entry.data[0], 0, true) }" v-for="parameter in entry.data[0].parameters" v-model="parameter.value" :label="parameter.key" :required="!parameter.optional" />
					</div>
					<button v-if="editing" @click="$confirm({ message: 'Are you sure you want to delete this entry?', type: 'question', ok: 'Delete' }).then(function() { row.entries.splice(row.entries.indexOf(entry), 1) });$event.stopPropagation()" class="delete"></button></h2>
				
				<div v-if="entry.type == 'TABULAR'" class="entry-table">
					<table class="classic" v-for="data in entry.data" v-if="data.resultSet && data.resultSet.results && data.resultSet.results.length">
						<thead>
							<tr>
								<td @click="sort(data, key)" 
									v-for="key in Object.keys(data.resultSet.results[0])"><span>{{ key }}</span>
										<span class="n-icon n-icon-sort-asc" v-if="data.orderBy.indexOf(key) >= 0"></span>
										<span class="n-icon n-icon-sort-desc" v-if="data.orderBy.indexOf(key + ' desc') >= 0"></span></td>
							</tr>
						</thead>
						<tbody>
							<tr v-for="result in data.resultSet.results">
								<td v-for="key in result">{{ key }}</td>
							</tr>
						</tbody>
					</table>
					<div class="options" v-if="entry.data && entry.data.length && entry.data[0].resultSet">
						<n-form-text class="limit" v-model="entry.data[0].limit" v-if="editing" v-timeout:input="function() { loadPage(entry.data[0], 0, true) }"/>
						<n-paging :value="entry.data[0].resultSet.page.current" :total="entry.data[0].resultSet.page.total" :load="loadPage.bind(this, entry.data[0])"/>
					</div>
					<div class="actions" v-if="editing">
						<button class="info" @click="addDataSource(entry, true)">Set Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'SERIES'">
					<n-analytics-graph :entry="entry"/>
					<div class="actions" v-if="editing">
						<n-form class="layout1">
							<n-form-section>
								<n-form-switch v-model="entry.showAxisTitle" label="Show Axis Title" :edit="true"/>
								<n-form-switch v-model="entry.showLegend" label="Show Legend" :edit="true"/>
							</n-form-section>
						</n-form>
						<button class="info" @click="addDataSource(entry).then(function() { entry.drawn = false })">Add Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'GAUGE'">
					<n-analytics-pie :entry="entry"/>
					<div class="actions" v-if="editing">
						<n-form class="layout1">
							<n-form-section>
								<n-form-switch v-model="entry.showAxisTitle" label="Show Axis Title" :edit="true"/>
								<n-form-switch v-model="entry.showLegend" label="Show Legend" :edit="true"/>
							</n-form-section>
						</n-form>
						<button class="info" @click="addDataSource(entry, true).then(function() { entry.drawn = false })">Set Data Source</button>
					</div>
				</div>
			</div>
			<div class="actions">
				<button v-if="editing" class="info" @click="addEntry(row)"><span class="n-icon n-icon-plus"></span></button>
			</div>
		</div>
	</div>
</template>