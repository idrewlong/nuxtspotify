<template>
	<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-lg">
		<div class="border-2 border-blue-400 rounded p-4">
			<h2 class="text-xl font-bold text-blue-600 mb-4">Web Music Player</h2>

			<!-- Login Button -->
			<button
				v-if="!isAuthenticated"
				@click="login"
				class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
			>
				Connect Spotify
			</button>

			<!-- Player Interface -->
			<div v-else>
				<!-- Search Input -->
				<div class="mb-4">
					<input
						type="text"
						v-model="searchQuery"
						@input="searchTracks"
						placeholder="Search for a song..."
						class="w-full p-2 border rounded"
					/>
				</div>

				<!-- Search Results -->
				<div
					v-if="searchResults.length"
					class="mb-4 max-h-48 overflow-y-auto border rounded"
				>
					<div
						v-for="track in searchResults"
						:key="track.id"
						@click="playTrack(track.uri)"
						class="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 border-b"
					>
						<img
							:src="track.album.images[2]?.url"
							class="w-10 h-10"
							alt="Album art"
						/>
						<div>
							<p class="font-medium">{{ track.name }}</p>
							<p class="text-sm text-gray-600">{{ track.artists[0].name }}</p>
						</div>
					</div>
				</div>

				<!-- Now Playing Section -->
				<div v-if="currentTrack" class="mb-4 p-4 bg-gray-50 rounded">
					<div class="flex flex-col items-center">
						<!-- Album Art -->
						<img
							:src="currentTrack.album?.images[0]?.url"
							class="w-48 h-48 object-cover rounded-lg shadow-lg mb-4"
							alt="Album art"
						/>

						<!-- Track Info -->
						<div class="text-center mb-4">
							<h3 class="font-bold text-lg">{{ currentTrack.name }}</h3>
							<p class="text-gray-600">{{ currentTrack.artists?.[0]?.name }}</p>
							<p class="text-sm text-gray-500">
								{{ currentTrack.album?.name }} •
								{{ currentTrack.album?.release_date?.slice(0, 4) }}
							</p>
						</div>

						<!-- Playback Controls -->
						<div class="flex items-center space-x-4">
							<button
								@click="previousTrack"
								class="p-2 hover:bg-gray-200 rounded-full"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>

							<button
								@click="togglePlay"
								class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full"
							>
								<svg
									v-if="!isPlaying"
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
									/>
								</svg>
								<svg
									v-else
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 9v6m4-6v6"
									/>
								</svg>
							</button>

							<button
								@click="nextTrack"
								class="p-2 hover:bg-gray-200 rounded-full"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import SpotifyWebApi from 'spotify-web-api-node';
import { ref, onMounted } from 'vue';
import { debounce } from 'lodash';

const config = useRuntimeConfig();
const isAuthenticated = ref(false);
const isPlaying = ref(false);
const currentTrack = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const deviceId = ref('');
let spotifyApi = null;
let player = null;

const spotifyConfig = {
	clientId: config.public.spotifyClient,
	redirectUri: 'http://localhost:3001/callback',
	scopes: [
		'streaming',
		'user-read-email',
		'user-read-private',
		'user-read-playback-state',
		'user-modify-playback-state',
		'user-library-read',
		'playlist-read-private',
		'app-remote-control',
	],
};

spotifyApi = new SpotifyWebApi({
	clientId: spotifyConfig.clientId,
});

const loadSpotifySDK = () => {
	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;
		document.body.appendChild(script);
		window.onSpotifyWebPlaybackSDKReady = resolve;
	});
};

const searchTracks = debounce(async () => {
	if (!searchQuery.value) {
		searchResults.value = [];
		return;
	}

	try {
		const response = await spotifyApi.searchTracks(searchQuery.value);
		searchResults.value = response.body.tracks.items;
	} catch (error) {
		console.error('Search error:', error);
	}
}, 300);

const playTrack = async (uri) => {
	try {
		await spotifyApi.play({
			device_id: deviceId.value,
			uris: [uri],
		});
		isPlaying.value = true;
	} catch (error) {
		console.error('Playback error:', error);
	}
};

const nextTrack = async () => {
	try {
		await spotifyApi.skipToNext();
	} catch (error) {
		console.error('Next track error:', error);
	}
};

const previousTrack = async () => {
	try {
		await spotifyApi.skipToPrevious();
	} catch (error) {
		console.error('Previous track error:', error);
	}
};

const login = () => {
	const authUrl = `https://accounts.spotify.com/authorize?client_id=${
		spotifyConfig.clientId
	}&response_type=token&redirect_uri=${encodeURIComponent(
		spotifyConfig.redirectUri
	)}&scope=${encodeURIComponent(spotifyConfig.scopes.join(' '))}`;
	window.location.href = authUrl;
};

const handleCallback = async () => {
	const hash = window.location.hash.substring(1);
	const params = new URLSearchParams(hash);
	const accessToken = params.get('access_token');

	if (accessToken) {
		spotifyApi.setAccessToken(accessToken);
		isAuthenticated.value = true;
		await initializePlayer(accessToken);
	}
};

const initializePlayer = async (token) => {
	await loadSpotifySDK();

	player = new Spotify.Player({
		name: 'Web Player',
		getOAuthToken: (cb) => cb(token),
		volume: 0.5,
	});

	player.addListener('ready', ({ device_id }) => {
		console.log('Ready with Device ID', device_id);
		deviceId.value = device_id;
	});

	player.addListener('player_state_changed', (state) => {
		if (state) {
			currentTrack.value = state.track_window.current_track;
			isPlaying.value = !state.paused;
		}
	});

	player.addListener('initialization_error', ({ message }) => {
		console.error('Failed to initialize', message);
	});

	player.addListener('authentication_error', ({ message }) => {
		console.error('Failed to authenticate', message);
	});

	player.addListener('account_error', ({ message }) => {
		console.error('Failed to validate Spotify account', message);
	});

	await player.connect();
};

const togglePlay = async () => {
	await player?.togglePlay();
	isPlaying.value = !isPlaying.value;
};

onMounted(() => {
	if (window.location.hash.includes('access_token')) {
		handleCallback();
	}
});

// const checkAutoplay = async () => {
// 	try {
// 		await document.createElement('audio').play();
// 		return true;
// 	} catch (error) {
// 		console.warn('Autoplay may be blocked:', error);
// 		alert('Please enable autoplay in your browser settings');
// 		return false;
// 	}
// };
</script>
