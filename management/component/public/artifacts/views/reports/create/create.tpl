<template id="analyticsReportCreate">
	<n-form class="layout1 analyticsReportCreate" ref="form">
		<n-form-section>
			<n-form-section>
				<n-form-text v-timeout:input.form="validate" v-focus v-model="name" label="Name" :validator="validateReport"/>
			</n-form-section>
			<footer class="actions">
				<a href="javascript:void(0)" @click="$reject()">Cancel</a>
				<button class="info" @click="create" :disabled="!valid">Create</button>
			</footer>
		</n-form-section>
	</n-form>
</template>