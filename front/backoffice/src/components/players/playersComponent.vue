<script setup lang="ts">
import PlayersFilters from './playersFilters.vue'
import PlayersPopup from './playersPopup.vue'
import { computed } from 'vue'
import { usePlayersStore } from '../../stores/playersStore'
import { VDataTableServer } from 'vuetify/labs/components'
import type { IPlayer } from 'core/interfaces'
import { ref } from 'vue'
import { mdiPencilOutline } from '@mdi/js'

const playersPopup = ref<InstanceType<typeof PlayersPopup> | null>(null)

const page = computed({
    get() {
        return usePlayersStore().getPage
    },
    set(page: number) {
        usePlayersStore().setPage(page)
    }
})
const nbResults = computed({
    get() {
        return usePlayersStore().getNbResults
    },
    set(nb: number) {
        usePlayersStore().setNbResults(nb)
    }
})
const nbPlayers = computed(() => usePlayersStore().getNbPlayers)
const players = computed(() => usePlayersStore().getPlayers)
const isLoading = computed(() => usePlayersStore().isLoading)
const headers = [
    {
        title: 'Picture',
        key: 'infos.picture'
    },
    {
        title: 'First name',
        key: 'infos.firstName'
    },
    {
        title: 'Last name',
        key: 'infos.lastName'
    },
    {
        title: 'Nationality',
        key: 'infos.country'
    },
    {
        title: 'Date of birth',
        key: 'infos.dateOfBirth'
    },
    {
        title: 'Category',
        key: 'infos.category'
    },
    {
        title: 'Pro since',
        key: 'proSince'
    },
    {
        title: 'Main hand',
        key: 'style.mainHand'
    },
    {
        title: 'Backhand',
        key: 'style.backhand'
    },
    {
        title: 'Actions',
        key: 'actions'
    }
]

const edit = (player: any) => {
    playersPopup.value?.edit(player.raw as IPlayer)
}
</script>

<template>
    <section id="players">
        <v-data-table-server
            density="compact"
            :headers="headers"
            :items="players"
            :items-length="nbPlayers"
            v-model:items-per-page="nbResults"
            item-value="_id"
            :loading="isLoading"
            v-model:page="page"
            @update:options="usePlayersStore().fetchPlayers()"
            @update:items-per-page="usePlayersStore().fetchPlayers()"
            @update:page="usePlayersStore().fetchPlayers()"
        >
            <template v-slot:top>
                <v-toolbar density="compact" flat>
                    <players-filters />

                    <v-spacer></v-spacer>

                    <players-popup ref="playersPopup" />
                </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
                <tr>
                    <td><img :src="item.raw.infos.picture" height="30" /></td>
                    <td>{{ item.raw.infos.firstName }}</td>
                    <td>{{ item.raw.infos.lastName }}</td>
                    <td>{{ item.raw.infos.country }}</td>
                    <td>{{ item.raw.infos.dateOfBirth }}</td>
                    <td>{{ item.raw.infos.category }}</td>
                    <td>{{ item.raw.proSince }}</td>
                    <td>{{ item.raw.style.mainHand }}</td>
                    <td>{{ item.raw.style.backhand }}</td>
                    <td class="d-flex align-center justify-center">
                        <v-btn
                            density="compact"
                            :icon="mdiPencilOutline"
                            flat
                            @click="edit(item as unknown as IPlayer)"
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
