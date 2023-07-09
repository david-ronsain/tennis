<script setup lang="ts">
import { TournamentCategoryFilter, TournamentSurfaceFilter } from 'core/enums'
import { computed } from 'vue'
import { useTournamentsStore } from '../../stores/tournamentsStore'
import { watch } from 'vue'

const categories = Object.values(TournamentCategoryFilter)
const surfaces = Object.values(TournamentSurfaceFilter)

const category = computed({
    get() {
        return useTournamentsStore().getCategory
    },
    set(cat: TournamentCategoryFilter) {
        useTournamentsStore().setCategory(cat)
    }
})
const search = computed({
    get() {
        return useTournamentsStore().getSearch
    },
    set(s: string) {
        useTournamentsStore().setSearch(s)
    }
})
const surface = computed({
    get() {
        return useTournamentsStore().getSurface
    },
    set(s: string) {
        useTournamentsStore().setSurface(s)
    }
})

watch(category, () => useTournamentsStore().fetchTournaments())
watch(search, () => useTournamentsStore().fetchTournaments())
watch(surface, () => useTournamentsStore().fetchTournaments())
</script>

<template>
    <div id="tournaments-filters" class="d-flex justify-space-between align-center">
        <v-select
            class="mr-3"
            clearable
            v-model="category"
            label="Category"
            placeholder="Choose a category"
            :items="categories"
            variant="underlined"
            density="compact"
            hide-details="auto"
            @click:clear="category = ''"
        />

        <v-select
            class="mr-3"
            clearable
            v-model="surface"
            label="Surface"
            placeholder="Choose a surface"
            :items="surfaces"
            variant="underlined"
            density="compact"
            hide-details="auto"
            @click:clear="surface = ''"
        />

        <v-text-field
            placeholder="Search"
            variant="underlined"
            clearable
            density="compact"
            hide-details
            v-model="search"
        />
    </div>
</template>

<style lang="scss">
#tournaments-filters {
    .v-text-field {
        width: 200px;
    }
}
</style>
