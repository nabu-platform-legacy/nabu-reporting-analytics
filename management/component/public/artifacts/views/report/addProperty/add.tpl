<template id="analyticsReportAddProperty">
	<n-form class="analyticsReportAddProperty classic" ref="form">
		<n-form-section>
			<n-form-text v-timeout:input.form="validate" :required="true" v-focus v-model="name" label="Name" />
			<n-form-combo v-timeout:input.form="validate" :required="true" v-model="typeName" label="Type" :items="['string', 'int', 'double', 'date', 'time', 'dateTime']" />
		</n-form-section>
		<footer class="actions">
			<a href="javascript:void(0)" @click="$reject()">Cancel</a>
			<button class="info" @click="add" :disabled="!valid">Add</button>
		</footer>
	</n-form>
</template>