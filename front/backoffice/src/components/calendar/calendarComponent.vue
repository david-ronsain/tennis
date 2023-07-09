<script setup lang="ts">
import CalendarFilters from './calendarFilters.vue'
import CalendarPopup from './calendarPopup.vue'
import { computed } from 'vue'
import { useCalendarStore } from '../../stores/calendarStore'
import { VDataTableServer } from 'vuetify/labs/components'
import type { ICalendar } from 'core/interfaces'
import { ref } from 'vue'
import { mdiPencilOutline, mdiTournament } from '@mdi/js'

const calendarPopup = ref<InstanceType<typeof CalendarPopup> | null>(null)

const page = computed({
    get() {
        return useCalendarStore().getPage
    },
    set(page: number) {
        useCalendarStore().setPage(page)
    }
})
const nbResults = computed({
    get() {
        return useCalendarStore().getNbResults
    },
    set(nb: number) {
        useCalendarStore().setNbResults(nb)
    }
})
const nbCalendars = computed(() => useCalendarStore().getNbCalendars)
const calendars = computed(() => useCalendarStore().getCalendars)
const isLoading = computed(() => useCalendarStore().isLoading)
const headers = [
    {
        title: 'Tournament',
        key: 'tournament.name'
    },
    {
        title: 'Start date',
        key: 'startDate'
    },
    {
        title: 'End date',
        key: 'endDate'
    },
    {
        title: 'Prize money',
        key: 'prizeMoney'
    },
    {
        title: 'Drawn made',
        key: 'drawn'
    },
    {
        title: 'Actions',
        key: 'actions'
    }
]

const edit = (calendar: any) => {
    calendarPopup.value?.edit(calendar.raw as ICalendar)
}
</script>

<template>
    <section id="calendars">
        <v-data-table-server
            density="compact"
            :headers="headers"
            :items="calendars"
            :items-length="nbCalendars"
            v-model:items-per-page="nbResults"
            item-value="_id"
            :loading="isLoading"
            :page="page"
            @update:options="useCalendarStore().fetchCalendars()"
            @update:items-per-page="useCalendarStore().fetchCalendars()"
            @update:page="useCalendarStore().fetchCalendars()"
        >
            <template v-slot:top>
                <v-toolbar density="compact" flat>
                    <calendar-filters />

                    <v-spacer></v-spacer>

                    <calendar-popup ref="calendarPopup" />
                </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.raw.tournament.name }}</td>
                    <td>{{ item.raw.startDate }}</td>
                    <td>{{ item.raw.endDate }}</td>
                    <td>{{ item.raw.prizeMoney }}</td>
                    <td>{{ !!item.raw.draw ? 'Yes' : 'No' }}</td>
                    <td class="d-flex align-center justify-center">
                        <v-btn
                            density="compact"
                            :icon="mdiPencilOutline"
                            flat
                            @click="edit(item as unknown as ICalendar)"
                        />
                        <v-btn
                            v-if="!item.raw.draw"
                            density="compact"
                            :icon="mdiTournament"
                            flat
                            @click="useCalendarStore().draw(item.raw._id)"
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
