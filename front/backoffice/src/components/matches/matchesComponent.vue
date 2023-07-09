<script setup lang="ts">
import MatchesPopup from './matchesPopup.vue'
import MatchesFilters from './matchesFilters.vue'
import { computed } from 'vue'
import { useMatchesStore } from '../../stores/matchesStore'
import { VDataTableServer } from 'vuetify/labs/components'
import { ref } from 'vue'
import { mdiPencilOutline } from '@mdi/js'
import { formatPlayerName } from 'front-common'
import type { MatchState } from 'core/enums'

const matchesPopup = ref<InstanceType<typeof MatchesPopup> | null>(null)

const page = computed({
    get() {
        return useMatchesStore().getPage
    },
    set(page: number) {
        useMatchesStore().setPage(page)
    }
})
const nbResults = computed({
    get() {
        return useMatchesStore().getNbResults
    },
    set(nb: number) {
        useMatchesStore().setNbResults(nb)
    }
})
const nbMatches = computed(() => useMatchesStore().getNbMatches)
const matches = computed(() => useMatchesStore().getMatches)
const isLoading = computed(() => useMatchesStore().isLoading)
const headers = [
    { title: 'tournament', key: 'tournament.name' },
    { title: 'Round', key: 'round' },
    { title: 'Team 1', key: 'team1.number' },
    { title: 'Team 2', key: 'team2.number' },
    { title: 'State', key: 'state' },
    { title: 'Score', key: 'score', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false }
]

const edit = (_id: string, state: MatchState) => {
    matchesPopup.value?.edit({ _id, state })
}
</script>

<template>
    <section id="players">
        <v-data-table-server
            density="compact"
            :headers="headers"
            :items="matches"
            :items-length="nbMatches"
            v-model:items-per-page="nbResults"
            item-value="_id"
            :loading="isLoading"
            v-model:page="page"
            @update:options="useMatchesStore().fetchMatches()"
            @update:items-per-page="useMatchesStore().fetchMatches()"
            @update:page="useMatchesStore().fetchMatches()"
        >
            <template v-slot:top>
                <v-toolbar density="compact" flat>
                    <matches-filters />
                    <matches-popup ref="matchesPopup" />
                </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.raw.tournament.name }}</td>
                    <td>{{ item.raw.round }}</td>
                    <td>
                        {{
                            formatPlayerName(item.raw.team1.player1) +
                            formatPlayerName(item.raw.team1.player2, ' / ')
                        }}
                    </td>
                    <td>
                        {{
                            formatPlayerName(item.raw.team2.player1) +
                            formatPlayerName(item.raw.team2.player2, ' / ')
                        }}
                    </td>
                    <td>{{ item.raw.state }}</td>
                    <td>
                        {{
                            item.raw.score
                                ? item.raw.score.history.map((h: any) => h.join('-')).join(' ')
                                : ''
                        }}
                    </td>
                    <td class="d-flex align-center justify-center">
                        <v-btn
                            density="compact"
                            :icon="mdiPencilOutline"
                            flat
                            @click="edit(item.raw._id.toString(), item.raw.state as MatchState)"
                        />
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </section>
</template>

<style lang="scss">
.v-toolbar {
    background: none;

    .v-field__input {
        padding-top: 0;
    }
}
</style>
