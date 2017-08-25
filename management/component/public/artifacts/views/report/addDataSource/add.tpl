<template id="analyticsReportAddDataSource">
	<n-form ref="form" class="layout1 analyticsReportAddDataSource">
		<n-form-section>
			<n-form-section>
				<n-form-text v-if="named" v-timeout:input.form="validate" :required="named" v-focus v-model="name" label="Name" />
				<n-form-combo v-timeout:input.form="validate" :required="true" label="Source" v-model="source" :items="filteredSources" :formatter="function(x) { return x.id }" />
				
				<n-form-combo v-if="source && source.database" v-timeout:input.form="validate" label="Connection" v-model="connectionId" :items="$services.manager.connections()"/>
				
				<n-form-combo v-if="type == 'SERIES' && source && source.output && source.output.length > 2" label="Group By" v-model="groupBy" :items="source.output.map(function(x) { return x.name })"/>
				
				<n-form-section v-for="property in properties">
					<n-form-text v-timeout:input.form="validate" :label="property.key" :required="!property.optional"
						v-model="property.value"/>
				</n-form-section>
			</n-form-section>
			<footer class="actions">
				<a href="javascript:void(0)" @click="$reject()">Cancel</a>
				<button class="info" @click="create" :disabled="!valid">Create</button>
			</footer>
		</n-form-section>
	</n-form>
</template>