<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMatchesStore } from '../../stores/matchesStore'
import { io } from 'socket.io-client'
import type { MatchResponse } from 'core/responses'
import { formatPlayerName } from 'front-common'

const socket = io(import.meta.env.VITE_WEBSOCKET_API_URL + 'matches')
socket.on('connect', () => {
    socket.on('new_score', (match: MatchResponse) => {
        useMatchesStore().refreshMatch(match)
    })
})

onMounted(() => {
    useMatchesStore().loadCurrentMatches()
})

const currentMatches = computed(() => useMatchesStore().getCurrentMatches)
</script>

<template>
    <header class="pr-0">
        <v-container>
            <v-row>
                <v-col
                    sm="12"
                    md="6"
                    lg="3"
                    v-for="match in currentMatches"
                    :key="match._id?.toString()"
                >
                    <router-link
                        :to="{
                            name: 'tournament',
                            params: { id: match?.tournament?._id.toString() }
                        }"
                    >
                        <router-view
                            name="matchScore"
                            :id="match._id.toString()"
                            :team1-name="
                                formatPlayerName(match.team1.player1) +
                                formatPlayerName(match.team1.player2, ' - ')
                            "
                            :team1-number="match.team1.number"
                            :team2-name="
                                formatPlayerName(match.team2.player1) +
                                formatPlayerName(match.team2.player2, ' - ')
                            "
                            :team2-number="match.team2.number"
                            :score="match.score"
                            :state="match.state"
                        />
                        <v-tooltip
                            location="start"
                            activator="parent"
                            :text="match.round + ' - ' + match.tournament?.name"
                        >
                        </v-tooltip>
                    </router-link>
                </v-col>
            </v-row>
        </v-container>
    </header>
</template>

<style scoped lang="scss">
header > div {
    max-width: none;

    > div > div {
        margin: -8px;
    }
}
</style>
