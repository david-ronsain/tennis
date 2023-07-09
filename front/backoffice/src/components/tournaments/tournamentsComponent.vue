<script setup lang="ts">
import TournamentsFilters from './tournamentsFilters.vue'
import TournamentsPopup from './tournamentsPopup.vue'
import { computed } from 'vue'
import { useTournamentsStore } from '../../stores/tournamentsStore'
import { VDataTableServer } from 'vuetify/labs/components'
import type { ITournament } from 'core/interfaces'
import { ref } from 'vue'
import { mdiPencilOutline } from '@mdi/js'

const tournamentsPopup = ref<InstanceType<typeof TournamentsPopup> | null>(null)

const page = computed({
    get() {
        return useTournamentsStore().getPage
    },
    set(page: number) {
        useTournamentsStore().setPage(page)
    }
})
const nbResults = computed({
    get() {
        return useTournamentsStore().getNbResults
    },
    set(nb: number) {
        useTournamentsStore().setNbResults(nb)
    }
})
const nbTournaments = computed(() => useTournamentsStore().getNbTournaments)
const tournaments = computed(() => useTournamentsStore().getTournaments)
const isLoading = computed(() => useTournamentsStore().isLoading)
const headers = [
    {
        title: 'Name',
        key: 'name'
    },
    {
        title: 'Category',
        key: 'category'
    },
    {
        title: 'Surface',
        key: 'surface'
    },
    {
        title: 'Creation year',
        key: 'creationYear'
    },
    {
        title: 'Country',
        key: 'country'
    },
    {
        title: 'Prize money',
        key: 'prizeMoney'
    },
    {
        title: 'Actions',
        key: 'actions'
    }
]

const edit = (tournament: any) => {
    tournamentsPopup.value?.edit(tournament.raw as ITournament)
}
</script>

<template>
    <section id="players">
        <v-data-table-server
            density="compact"
            :headers="headers"
            :items="tournaments"
            :items-length="nbTournaments"
            v-model:items-per-page="nbResults"
            item-value="_id"
            :loading="isLoading"
            :page="page"
            @update:options="useTournamentsStore().fetchTournaments()"
            @update:items-per-page="useTournamentsStore().fetchTournaments()"
            @update:page="useTournamentsStore().fetchTournaments()"
        >
            <template v-slot:top>
                <v-toolbar density="compact" flat>
                    <tournaments-filters />

                    <v-spacer></v-spacer>

                    <tournaments-popup ref="tournamentsPopup" />
                </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.raw.name }}</td>
                    <td>{{ item.raw.category }}</td>
                    <td>{{ item.raw.surface }}</td>
                    <td>{{ item.raw.creationYear }}</td>
                    <td>{{ item.raw.country }}</td>
                    <td>{{ item.raw.prizeMoney }}</td>
                    <td class="d-flex align-center justify-center">
                        <v-btn
                            density="compact"
                            :icon="mdiPencilOutline"
                            flat
                            @click="edit(item as unknown as ITournament)"
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
