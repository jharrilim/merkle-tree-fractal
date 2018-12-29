import { MerkleTree } from '@jharrilim/merkletree-js';


export class FractalTree {
    private static merkleTreeLimit = 1 << 3;

    private merkleTree: MerkleTree;
    private hash: any;
    private childTrees: FractalTree[];
    private childLimit: number;
    private treeState: AsyncIterableIterator<void>;
    private data: any;

    private constructor(maxChildren: number) {
        this.merkleTree = MerkleTree.create();
        this.childTrees = [];
        this.childLimit = maxChildren < 2 ? 2 : maxChildren;
        this.treeState = this._addNode();
    }

    public static create() {
        return new FractalTree(2);
    }

    public async addNode(data: any): Promise<void> {
        this.data = data;
        await this.treeState.next();
    }

    /**
     * Some random algorithm I made up to place hashes in a particular pattern.
     * It first looks to fill the merkle tree until the limit is reached. After that,
     * It will check the child limit to see if it can spawn children. If it cannot, it will
     * just return. If it can, it will enter an endless cycle. It will create new children
     * with size limits of half of what the parent has. Blah blah blah, it creates a binary
     * tree in a way that I THINK is peculiar.
     *
     * @private
     * @returns {AsyncIterableIterator<void>}
     * @memberof FractalTree
     */
    private async *_addNode(): AsyncIterableIterator<void> {
        // First fill out this node's merkle tree
        while (this.merkleTree.length < FractalTree.merkleTreeLimit) {
            yield void await this.merkleTree.addNode(this.data);
        }
        // Compute the hash and save it after it has finished adding all of the data to the tree
        this.hash = await this.merkleTree.computeRootHash();

        // this will bring you up to the parent
        if (this.childLimit === 0) {
            return;
        }

        while (true) {
            // this.childLimit >> 1 so that you always start at the halfway point
            for (let i = this.childLimit >> 1; i < this.childLimit; ++i) {
                // Each inner tree starts at half the size of it's parent
                this.childTrees[i] = new FractalTree(this.childLimit >> 1);

                // yields control into the child generator
                yield* await this.childTrees[i]._addNode();
            }
            // shift left and continue the cycle
            this.childLimit <<= 1;
        }
    }
}