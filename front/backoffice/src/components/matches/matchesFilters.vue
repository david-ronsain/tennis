<script setup lang="ts">
import { computed } from 'vue'
import { useMatchesStore } from '../../stores/matchesStore'
import { watch } from 'vue'
import { ref } from 'vue'
import { mdiCalendar } from '@mdi/js'
import { VDatePicker } from 'vuetify/labs/components'
import { onMounted } from 'vue'
import { PlayerCategoryFilter } from 'core/enums'

const startDateOpened = ref(false)
const endDateOpened = ref(false)
const sd = ref()
const ed = ref()
const categories = [PlayerCategoryFilter.ALL, PlayerCategoryFilter.ATP, PlayerCategoryFilter.WTA]

const tournament = computed({
    get() {
        return useMatchesStore().getTournament
    },
    set(t: any) {
        useMatchesStore().setTournament(t)
    }
})
const category = computed({
    get() {
        return useMatchesStore().getCategory
    },
    set(cat: any) {
        useMatchesStore().setCategory(cat)
    }
})
const startDate = computed({
    get() {
        return (useMatchesStore().getStartDate ?? '').substring(0, 10)
    },
    set(date: any) {
        useMatchesStore().setStartDate(date)
    }
})
const endDate = computed({
    get() {
        return (useMatchesStore().getEndDate ?? '').substring(0, 10)
    },
    set(date: any) {
        useMatchesStore().setEndDate(date)
    }
})
const tournaments = computed(() => useMatchesStore().getTournaments)
const search = computed({
    get() {
        return useMatchesStore().getSearch
    },
    set(s: string) {
        useMatchesStore().setSearch(s)
    }
})

watch(ed, () => (endDate.value = new Date(ed.value).toISOString()))
watch(sd, () => (startDate.value = new Date(sd.value).toISOString()))
watch(startDate, () => useMatchesStore().fetchMatches())
watch(endDate, () => useMatchesStore().fetchMatches())
watch(tournament, () => useMatchesStore().fetchMatches())
watch(search, () => useMatchesStore().fetchMatches())
watch(category, () => useMatchesStore().fetchMatches())

onMounted(() => {
    useMatchesStore().fetchTournaments()
})
</script>

<template>
    <div id="matches-filters" class="d-flex justify-space-between align-center">
        <v-autocomplete
            class="mr-3"
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

        <v-btn-toggle class="mr-3" v-model="category" variant="outlined" density="compact" divided>
            <v-btn v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
            </v-btn>
        </v-btn-toggle>

        <v-text-field
            class="mr-3"
            placeholder="Search"
            variant="underlined"
            clearable
            density="compact"
            hide-details
            v-model="search"
        />

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
    </div>
</template>

<style lang="scss">
#matches-filters {
    .v-text-field {
        width: 200px;
    }
}
</style>
