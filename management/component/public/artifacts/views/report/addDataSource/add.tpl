<template id="analyticsReportAddDataSource">
	<n-form ref="form" class="layout1 analyticsReportAddDataSource">
		<n-form-section>
			<n-form-section>
				<n-form-text v-if="named" v-timeout:input.form="validate" :required="true" v-focus v-model="name" label="Name" />
				<n-form-combo v-timeout:input.form="validate" :required="true" label="Source" v-model="source" :items="filteredSources" :formatter="function(x) { return x.id }" />
			</n-form-section>
			<footer class="actions">
				<a href="javascript:void(0)" @click="$reject()">Cancel</a>
				<button class="info" @click="create" :disabled="!valid">Create</button>
			</footer>
		</n-form-section>
	</n-form>
</template>