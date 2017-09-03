<template id="analyticsReport">
	<div class="analyticsReport" :class="{'editing': editing}">
		<div class="page-menu">
			<h1 class="title">{{ report.name }}</h1>
			<button v-if="!editing && editable" class="info" @click="editing = true"><span class="n-icon n-icon-pencil"></span>Edit</button>
			<button v-if="!editing" ref="copier"><span class="n-icon n-icon-clipboard"></span>Copy to Clipboard</button>
			<button v-if="editing" class="info" @click="addRow"><span class="n-icon n-icon-plus"></span>Add Row</button>
			<button v-if="editing" class="success" @click="save"><span class="n-icon n-icon-save"></span>Save</button>
			<button v-if="editing" @click="cancel"><span class="n-icon n-icon-times"></span>Cancel</button>
		</div>
		<div v-for="row in report.rows" class="row" :class="'row-' + (row.entries.length + (report.rows.indexOf(row) == 0 && report.parameters && report.parameters.length ? 1 : 0))">
			<section class="parameters card" v-if="report.rows.indexOf(row) == 0 && (editing || (report.parameters && report.parameters.length))">
				<h2>Parameters</h2>
				<div class="container">
					<div class="property" v-for="property in report.parameters">
						<n-form-text :label="property.key" v-model="property.value" v-timeout:input="update"/>
						<button v-if="editing" class="delete" @click="deleteProperty(property)"></button>
					</div>
					<div class="actions" v-if="editing">
						<button class="info" @click="addProperty"><span class="n-icon n-icon-plus"></span>Add Property</button>
					</div>
				</div>
			</section>
			<div v-for="entry in row.entries" class="card" :class="'type-' + entry.type">
				<h2 v-auto-close="function() { toggleFilter(entry, false) }">
					<div class="download">
						<span class="n-icon n-icon-refresh" @click="refresh(entry)"></span>
						<span class="n-icon n-icon-search" @click="toggleFilter(entry)" v-if="entry.data && entry.data.length && entry.data[0].parameters && entry.data[0].parameters.length && (!entry.data[0].boundParameters || amountOfBound(entry.data[0]) < entry.data[0].parameters.length)"></span>
						<span v-if="entry.data && entry.data.length && entry.type != 'GAUGE'" class="n-icon n-icon-table" title="Download as CSV" @click="$services.analytics.data.download(entry.data, 'csv')"></span>
						<span v-if="entry.data && entry.data.length && entry.type != 'GAUGE'" class="n-icon n-icon-code" title="Download as XML" @click="$services.analytics.data.download(entry.data, 'xml')"></span>
						<span v-if="entry.data && entry.data.length && entry.type != 'GAUGE'" class="n-icon n-icon-download" title="Download as JSON" @click="$services.analytics.data.download(entry.data, 'json')"></span>
						<button v-if="editing" @click="shiftEntry(row, entry, -1)"><span class='n-icon n-icon-chevron-left'></span></button
						><button v-if="editing" @click="shiftEntry(row, entry, 1)"><span class='n-icon n-icon-chevron-right'></span></button
						><button v-if="editing" @click="$confirm({ message: 'Are you sure you want to delete this entry?', type: 'question', ok: 'Delete' }).then(function() { row.entries.splice(row.entries.indexOf(entry), 1) });$event.stopPropagation()" class="delete"></button>
					</div>
					<n-form-text :edit="editing" v-model="entry.name"/> <n-info v-if="false && entry.description">{{ entry.description }}</n-info>
					<div class="filter" v-if="entry.showFilter">
						<n-form-text v-if="!isBound(entry, parameter)" v-timeout:input="function() { loadPage(entry.data[0], 0, true) }" v-for="parameter in entry.data[0].parameters" v-model="parameter.value" :label="parameter.key" :required="!parameter.optional" />
					</div>
					<n-form-text v-if="editing || entry.description" class="detail" :edit="editing" v-model="entry.description"/>
				</h2>
				
				<div v-if="entry.type == 'TABULAR'" class="entry-table">
					<table class="classic" v-for="data in entry.data" v-if="data.resultSet && data.resultSet.results && data.resultSet.results.length">
						<thead>
							<tr>
								<td @click="sort(data, key)" 
									v-for="key in Object.keys(data.resultSet.results[0])" v-if="!isHidden(data, key)"><span>{{ key }}</span>
										<span class="n-icon n-icon-sort-asc" v-if="data.orderBy.indexOf(key) >= 0"></span>
										<span class="n-icon n-icon-sort-desc" v-if="data.orderBy.indexOf(key + ' desc') >= 0"></span>
								</td>
							</tr>
						</thead>
						<tbody>
							<tr v-for="result in data.resultSet.results" :class="{ 'clickable': entry.drillDown }">
								<td v-for="key in Object.keys(result)" v-if="!isHidden(data, key)" @click="drillDown(entry, result)" :class="{'good': entry.colorize && isGood(result[key]), 'bad': entry.colorize && isBad(result[key])}">{{ result[key] }}</td>
							</tr>
						</tbody>
					</table>
					<div class="options" v-if="entry.data && entry.data.length && entry.data[0].resultSet">
						<n-form-text class="limit" v-model="entry.data[0].limit" v-if="editing" v-timeout:input="function() { loadPage(entry.data[0], 0, true) }"/>
						<n-paging :value="entry.data[0].resultSet.page.current" :total="entry.data[0].resultSet.page.total" :load="loadPage.bind(this, entry.data[0])"/>
					</div>
					<div class="actions" v-if="editing">
						<n-form-section>
							<n-form-switch v-model="entry.colorize" label="Colorize" :edit="true"/>
						</n-form-section>
						<button class="info" @click="addDataSource(entry, true)">Set Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'SERIES'">
					<n-analytics-graph :entry="entry" :route="route"/>
					<div class="actions" v-if="editing">
						<n-form class="layout1">
							<n-form-section>
								<n-form-switch v-model="entry.showAxisTitle" label="Show Axis Title" :edit="true"/>
								<n-form-switch v-model="entry.showLegend" label="Show Legend" :edit="true"/>
								<n-form-switch v-model="entry.showDots" label="Show Dots" :edit="true"/>
								<n-form-switch v-model="entry.angleLabels" label="Angle Labels" :edit="true"/>
								<n-form-combo v-model="entry.formatter" label="Label Formatter (X)" :items="['date', 'dateTime', 'time']"/>
							</n-form-section>
						</n-form>
						<button class="info" @click="addDataSource(entry).then(function() { entry.drawn = false })">Add Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'WATERFALL'">
					<n-analytics-graph :entry="entry" :route="route"/>
					<div class="actions" v-if="editing">
						<n-form class="layout1">
							<n-form-section>
								<n-form-switch v-model="entry.showAxisTitle" label="Show Axis Title" :edit="true"/>
								<n-form-switch v-model="entry.showLegend" label="Show Legend" :edit="true"/>
								<n-form-switch v-model="entry.angleLabels" label="Angle Labels" :edit="true"/>
								<n-form-combo v-model="entry.formatter" label="Label Formatter (X)" :items="['date', 'dateTime', 'time']"/>
							</n-form-section>
						</n-form>
						<button class="info" @click="addDataSource(entry, true, false).then(function() { entry.drawn = false })">Set Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'GAUGE'">
					<n-analytics-pie :entry="entry" :route="route"/>
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
				<div v-if="entry.type == 'FACT'">
					<n-analytics-pie :entry="entry" :route="route"/>
					<div class="actions" v-if="editing">
						<n-form class="layout1">
							<n-form-section>
								<n-form-switch v-if="entry.drillDown" v-model="entry.drillDownValue" label="Value Drill" :edit="true"/>
								<n-form-switch v-model="entry.colorize" label="Colorize" :edit="true"/>
							</n-form-section>
						</n-form>
						<button class="info" @click="addDataSource(entry, true).then(function() { entry.drawn = false })">Set Data Source</button>
					</div>
				</div>
				<div v-if="entry.type == 'ROUTE'">
					<div v-route-render="generateRoute(entry)"></div>
				</div>
			</div>
			<div class="actions">
				<button v-if="editing" @click="shiftRow(report, row, -1)"><span class="n-icon n-icon-chevron-up"></span></button>
				<button v-if="editing" class="info" @click="addEntry(row)"><span class="n-icon n-icon-plus"></span></button>
				<button v-if="editing" class="delete" @click="deleteRow(row)"><span class="n-icon n-icon-times"></span></button>
				<button v-if="editing" @click="shiftRow(report, row, 1)"><span class="n-icon n-icon-chevron-down"></span></button>
			</div>
		</div>
	</div>
</template>