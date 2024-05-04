import { sampleFromWeights } from "./util.mjs";
import { BEHAVIORS } from "./behaviors.mjs";

export class Arrangement {
    // Atom atom
    // Behavior behavior

    constructor(atom, behavior, canvas_config) {
        this.behavior = behavior;
        this.atom = atom;

        if(this.behavior.twin_behavior_index != null) {
            this.twin_atom = this.findTwin(canvas_config);
        }
    }

    findTwin(canvas_config) {
        const candidate_atoms = this.atom.twins;

        var candidate_weights = candidate_atoms.map(candidate_atom =>
             candidate_atom.computeWeightForBehavior(
                 canvas_config, this.behavior.twin_behavior_index, true)
        );
        
        var sampled_twin = candidate_atoms[sampleFromWeights(candidate_weights)];
        
        return sampled_twin;
    }

    draw(area, graphix) {
        this.behavior.draw(this.atom, area, graphix);

        if (this.behavior.twin_behavior_index != null) {
            const twin_behavior = BEHAVIORS.get(this.behavior.twin_behavior_index);
            twin_behavior.draw(this.twin_atom, area, graphix);
        }
        
    }

    branch(canvas_config) {
        return this.behavior.branch(this.atom, canvas_config);
    }
}