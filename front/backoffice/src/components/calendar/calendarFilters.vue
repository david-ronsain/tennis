<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '../../stores/calendarStore'
import { watch } from 'vue'
import { ref } from 'vue'
import { mdiCalendar } from '@mdi/js'
import { VDatePicker } from 'vuetify/labs/components'
import { onMounted } from 'vue'

const startDateOpened = ref(false)
const endDateOpened = ref(false)
const sd = ref()
const ed = ref()

const tournament = computed({
    get() {
        return useCalendarStore().getTournament
    },
    set(t: any) {
        useCalendarStore().setTournament(t)
    }
})
const startDate = computed({
    get() {
        return useCalendarStore().getStartDate.substring(0, 10)
    },
    set(date: any) {
        useCalendarStore().setStartDate(date)
    }
})
const endDate = computed({
    get() {
        return useCalendarStore().getEndDate.substring(0, 10)
    },
    set(date: any) {
        useCalendarStore().setEndDate(date)
    }
})
const tournaments = computed(() => useCalendarStore().getTournaments)
const search = computed({
    get() {
        return useCalendarStore().getSearch
    },
    set(s: string) {
        useCalendarStore().setSearch(s)
    }
})

watch(ed, () => (endDate.value = new Date(ed.value).toISOString()))
watch(sd, () => (startDate.value = new Date(sd.value).toISOString()))
watch(startDate, () => useCalendarStore().fetchCalendars())
watch(endDate, () => useCalendarStore().fetchCalendars())
watch(tournament, () => useCalendarStore().fetchCalendars())
watch(search, () => useCalendarStore().fetchCalendars())

onMounted(() => {
    useCalendarStore().fetchTournaments()
})
</script>

<template>
    <div id="calendar-filters" class="d-flex justify-space-between align-center">
        <v-dialog class="date" v-model="startDateOpened" persistent>
            <template v-slot:activator="props">
                <v-text-field
                    class="mr-3"
                    v-model="startDate"
                    v-bind="props"
                    label="Start date"
                    variant="underlined"
                    clearable
                    density="compact"
                    hide-details="auto"
                    :append-inner-icon="mdiCalendar"
                    readonly
                    @click:clear="startDate = ''"
                    @click:append-inner="startDateOpened = true"
                />
            </template>
            <v-date-picker
                v-model="sd"
                @click:save="startDateOpened = false"
                @click:cancel="startDateOpened = false"
                title="Start date"
                hide-details="auto"
            />
        </v-dialog>

        <v-dialog class="date" v-model="endDateOpened" persistent>
            <template v-slot:activator="props">
                <v-text-field
                    class="mr-3"
                    v-model="endDate"
                    v-bind="props"
                    label="End date"
                    variant="underlined"
                    clearable
                    density="compact"
                    hide-details="auto"
                    :append-inner-icon="mdiCalendar"
                    readonly
                    @click:clear="endDate = ''"
                    @click:append-inner="endDateOpened = true"
                />
            </template>
            <v-date-picker
                v-model="ed"
                @click:save="endDateOpened = false"
                @click:cancel="endDateOpened = false"
                title="End date"
                hide-details="auto"
            />
        </v-dialog>

        <v-autocomplete
            v-model="tournament"
            label="Tournament"
            :items="tournaments"
            item-title="name"
            item-value="_id"
            variant="underlined"
            clearable
            density="compact"
            hide-details="auto"
        />
    </div>
</template>

<style lang="scss">
#calendar-filters {
    .v-text-field {
        width: 200px;
    }
}
</style>
