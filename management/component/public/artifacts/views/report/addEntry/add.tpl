<template id="analyticsReportAddEntry">
	<n-form ref="form" class="layout1 analyticsReportAddEntry">
		<n-form-section>
			<n-form-section>
				<n-form-text v-timeout:input.form="validate" :required="true" v-focus v-model="name" label="Name" />
				<n-form-combo v-timeout:input.form="validate" :required="true" label="Type" v-model="type" :filter="function() { return [ 'TABULAR', 'SERIES', 'GAUGE' ] }"/>
				<n-form-combo v-timeout:input.form="validate" v-if="type == 'SERIES'" :required="true" label="Sub Type" v-model="subType" :items="[ 'LINE', 'BAR', 'BAR_STACKED' ]"/>
				<n-form-combo v-timeout:input.form="validate" v-if="type == 'GAUGE'" :required="true" label="Sub Type" v-model="subType" :items="[ 'PIE', 'DONUT', 'DONUT_HALF' ]"/>
				<n-form-text type="area" v-model="description"/>
			</n-form-section>
			<footer class="actions">
				<a href="javascript:void(0)" @click="$reject()">Cancel</a>
				<button class="info" @click="create" :disabled="!valid">Create</button>
			</footer>
		</n-form-section>
	</n-form>
</template>