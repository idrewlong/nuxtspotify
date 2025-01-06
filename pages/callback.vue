<template>
	<div>Processing authentication...</div>
</template>

<script setup>
onMounted(() => {
	// The main component will handle the token via handleCallback()
	if (window.location.hash) {
		// Navigate back to the main page with the hash
		navigateTo('/' + window.location.hash);
	}
});
</script>
