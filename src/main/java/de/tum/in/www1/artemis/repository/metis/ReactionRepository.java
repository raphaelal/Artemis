package de.tum.in.www1.artemis.repository.metis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.tum.in.www1.artemis.domain.metis.Reaction;
import de.tum.in.www1.artemis.web.rest.errors.BadRequestAlertException;
import de.tum.in.www1.artemis.web.rest.errors.EntityNotFoundException;

/**
 * Spring Data repository for the Reaction entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    List<Reaction> findReactionsByPostId(Long postId);

    List<Reaction> findReactionsByAnswerPostId(Long answerPostId);

    List<Reaction> findReactionsByPostIdAndEmojiIdAndUserId(Long postId, String emojiId, Long userId);

    List<Reaction> findReactionsByAnswerPostIdAndEmojiIdAndUserId(Long answerPostId, String emojiId, Long userId);

    default Reaction findByIdElseThrow(Long reactionId) throws EntityNotFoundException {
        return findById(reactionId).orElseThrow(() -> new EntityNotFoundException("Reaction", reactionId));
    }

    default void findNoReactionsByPostIdAndEmojiIdAndUserIdElseThrow(Long postId, String emojiId, Long userId) throws BadRequestAlertException {
        findReactionsByPostIdAndEmojiIdAndUserId(postId, emojiId, userId).stream().findAny().ifPresent(reaction -> {
            throw new BadRequestAlertException("You can only react once with a certain emoji", emojiId, "duplicatedReaction");
        });
    }

    default void findNoReactionsByAnswerPostIdAndEmojiIdAndUserIdElseThrow(Long answerPostId, String emojiId, Long userId) throws BadRequestAlertException {
        findReactionsByAnswerPostIdAndEmojiIdAndUserId(answerPostId, emojiId, userId).stream().findAny().ifPresent(reaction -> {
            throw new BadRequestAlertException("You can only react once with a certain emoji", emojiId, "duplicatedReaction");
        });
    }
}
